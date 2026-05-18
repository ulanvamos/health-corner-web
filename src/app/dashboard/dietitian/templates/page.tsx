"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, Calendar, Utensils, Copy, Check, ChevronRight, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useDemoApp } from "@/components/demo-app-provider";

const DAYS_OF_WEEK = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export default function TemplatesPage() {
  const { user } = useDemoApp();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealName, setMealName] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [mealDesc, setMealDesc] = useState("");
  const [mealIngredients, setMealIngredients] = useState("");

  async function handleAddMeal() {
    const day = selectedTemplate.days[activeDayIdx];
    setSaving(true);
    try {
      const { data: newMeal, error } = await supabase
        .from('diet_template_meals')
        .insert({
          day_id: day.id,
          name: "Yeni Öğün",
          time_label: "00:00",
          description: "Açıklama girin",
          sort_order: day.meals.length
        })
        .select()
        .single();

      if (error) throw error;
      await loadTemplates();
      handleEditMeal(newMeal);
    } catch (err) {
      console.error("Add meal error:", err);
    } finally {
      setSaving(false);
    }
  }

  function handleEditMeal(meal: any) {
    setEditingMealId(meal.id);
    setMealName(meal.name);
    setMealTime(meal.time_label);
    setMealDesc(meal.description);
    setMealIngredients(meal.ingredients.join("\n"));
  }

  async function handleSaveMeal(mealId: string) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('diet_template_meals')
        .update({
          name: mealName,
          time_label: mealTime,
          description: mealDesc,
          ingredients: mealIngredients.split("\n").map(i => i.trim()).filter(Boolean)
        })
        .eq('id', mealId);

      if (error) throw error;
      setEditingMealId(null);
      await loadTemplates();
    } catch (err) {
      console.error("Save template meal error:", err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteMeal(mealId: string) {
    if (!confirm("Bu öğünü şablondan silmek istediğine emin misin?")) return;
    try {
      await supabase.from('diet_template_meals').delete().eq('id', mealId);
      await loadTemplates();
    } catch (err) {
      console.error("Delete meal error:", err);
    }
  }

  // Update selectedTemplate when templates change
  useEffect(() => {
    if (selectedTemplate) {
      const updated = templates.find(t => t.id === selectedTemplate.id);
      if (updated) setSelectedTemplate(updated);
    }
  }, [templates]);

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('diet_templates')
        .select('*, days:diet_template_days(*, meals:diet_template_meals(*))')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Sort days and meals
      const processedTemplates = (data || []).map(t => ({
        ...t,
        days: (t.days || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((d: any) => ({
          ...d,
          meals: (d.meals || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
        }))
      }));

      setTemplates(processedTemplates);
    } catch (err) {
      console.error("Load templates error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createTemplate() {
    const name = prompt("Şablon Adı (Örn: Ketojenik Başlangıç):");
    if (!name) return;

    setSaving(true);
    try {
      // 1. Create template
      const { data: template, error: tError } = await supabase
        .from('diet_templates')
        .insert({ name, dietitian_id: user?.id, description: "Hazır diyet programı şablonu" })
        .select()
        .single();

      if (tError) throw tError;

      // 2. Create 7 days
      const daysToInsert = DAYS_OF_WEEK.map((label, idx) => ({
        template_id: template.id,
        label: label,
        sort_order: idx
      }));

      await supabase.from('diet_template_days').insert(daysToInsert);

      await loadTemplates();
      alert("Şablon başarıyla oluşturuldu.");
    } catch (err) {
      console.error("Create template error:", err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Bu şablonu tamamen silmek istediğine emin misin?")) return;
    try {
      await supabase.from('diet_templates').delete().eq('id', id);
      if (selectedTemplate?.id === id) setSelectedTemplate(null);
      await loadTemplates();
    } catch (err) {
      console.error("Delete template error:", err);
    }
  }

  async function cloneDayToAll(sourceDay: any) {
    if (!confirm(`${sourceDay.label} menüsünü bu şablonun diğer tüm günlerine kopyalamak istediğine emin misin?`)) return;

    setSaving(true);
    try {
      const otherDays = selectedTemplate.days.filter((d: any) => d.id !== sourceDay.id);

      for (const targetDay of otherDays) {
        await supabase.from('diet_template_meals').delete().eq('day_id', targetDay.id);
        const mealsToClone = sourceDay.meals.map((m: any) => ({
          day_id: targetDay.id,
          name: m.name,
          time_label: m.time_label,
          description: m.description,
          ingredients: m.ingredients,
          sort_order: m.sort_order
        }));
        if (mealsToClone.length > 0) {
          await supabase.from('diet_template_meals').insert(mealsToClone);
        }
      }

      await loadTemplates();
      // Update selectedTemplate state locally
      const updated = templates.find(t => t.id === selectedTemplate.id);
      setSelectedTemplate(updated);
      alert("Menü tüm şablona kopyalandı!");
    } catch (err) {
      console.error("Clone error:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-[var(--muted)]">Şablonlar yükleniyor...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12">
      <header className="flex justify-between items-end border-b border-[rgba(47,44,40,0.08)] pb-8">
        <div>
          <h1 className="text-4xl font-black text-[var(--ink)] tracking-tight mb-2">Diyet Şablonlarım</h1>
          <p className="text-[var(--soft-ink)] font-medium">Danışanlarına tek tıkla atayabileceğin hazır diyet programları oluştur.</p>
        </div>
        <button
          onClick={createTemplate}
          className="bg-[var(--accent)] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#24794e] shadow-xl shadow-emerald-100 flex items-center gap-2"
        >
          <Plus size={18} /> YENİ ŞABLON OLUŞTUR
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-12">
        {/* Template List Sidebar */}
        <aside className="space-y-4">
          <h2 className="text-xs font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-6">Mevcut Şablonlar</h2>
          {templates.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-[rgba(47,44,40,0.1)] text-center">
              <FileText size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-xs text-[var(--muted)] font-bold">Henüz şablon yok.</p>
            </div>
          ) : (
            templates.map((t) => (
              <div
                key={t.id}
                onClick={() => { setSelectedTemplate(t); setActiveDayIdx(0); }}
                className={`group p-6 border transition-all cursor-pointer relative ${selectedTemplate?.id === t.id
                    ? "bg-white border-[var(--accent)] shadow-xl"
                    : "bg-white border-[rgba(47,44,40,0.06)] hover:border-[var(--accent)]/40 shadow-sm"
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[var(--ink)] pr-8">{t.name}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTemplate(t.id); }}
                    className="p-1.5 text-[var(--muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Calendar size={10} /> 7 GÜN</span>
                  <span className="flex items-center gap-1"><Utensils size={10} /> {t.days?.reduce((acc: number, d: any) => acc + (d.meals?.length || 0), 0)} ÖĞÜN</span>
                </div>
                {selectedTemplate?.id === t.id && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-[var(--accent)]" />
                )}
              </div>
            ))
          )}
        </aside>

        {/* Template Content */}
        <main>
          {!selectedTemplate ? (
            <div className="bg-gray-50/50 border-2 border-dashed border-[rgba(47,44,40,0.1)] h-[500px] flex flex-col items-center justify-center text-center p-12">
              <Utensils size={64} className="text-[var(--accent)] mb-6 opacity-10" />
              <h3 className="text-xl font-bold text-[var(--ink)] mb-2">Şablon Seçilmedi</h3>
              <p className="text-sm text-[var(--soft-ink)] max-w-sm">
                Sol taraftan bir şablon seçerek düzenlemeye başlayabilir veya yeni bir tane oluşturabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white border border-[rgba(47,44,40,0.08)] p-8">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-[rgba(47,44,40,0.06)]">
                  <div>
                    <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em] mb-1 block">ŞABLON DÜZENLENİYOR</span>
                    <h2 className="text-3xl font-black text-[var(--ink)] tracking-tight">{selectedTemplate.name}</h2>
                  </div>
                  <button
                    onClick={() => cloneDayToAll(selectedTemplate.days[activeDayIdx])}
                    className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--accent)] border-2 border-[var(--accent)] hover:bg-emerald-50 transition-all"
                  >
                    <Copy size={14} /> BU GÜNÜ TÜM ŞABLONA KOPYALA
                  </button>
                </div>

                {/* Day Tabs */}
                <div className="flex overflow-x-auto pb-2 gap-2 mb-8 scrollbar-hide">
                  {selectedTemplate.days.map((day: any, idx: number) => (
                    <button
                      key={day.id}
                      onClick={() => { setActiveDayIdx(idx); setEditingMealId(null); }}
                      className={`px-6 py-4 text-xs font-black whitespace-nowrap transition-all border-b-2 uppercase tracking-widest ${activeDayIdx === idx
                          ? "border-[var(--accent)] text-[var(--accent)] bg-emerald-50/50"
                          : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                        }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>

                {/* Meals */}
                <div className="space-y-4">
                  {selectedTemplate.days[activeDayIdx].meals.map((meal: any) => (
                    <div key={meal.id} className={`p-6 border-l-4 ${editingMealId === meal.id ? "border-amber-400 bg-amber-50/20" : "border-[var(--accent)] bg-gray-50/50"} transition-all group`}>
                      {editingMealId === meal.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-[150px_1fr] gap-6">
                            <div>
                              <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1 block">Saat</label>
                              <input value={mealTime} onChange={e => setMealTime(e.target.value)} className="w-full border border-[rgba(47,44,40,0.1)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]" />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1 block">Öğün Adı</label>
                              <input value={mealName} onChange={e => setMealName(e.target.value)} className="w-full border border-[rgba(47,44,40,0.1)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]" />
                            </div>
                          </div>
                          <textarea value={mealIngredients} onChange={e => setMealIngredients(e.target.value)} rows={3} className="w-full border border-[rgba(47,44,40,0.1)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]" placeholder="Malzemeler (her satıra bir adet)" />
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveMeal(meal.id)} className="bg-[var(--accent)] text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest">KAYDET</button>
                            <button onClick={() => setEditingMealId(null)} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--muted)] border">İPTAL</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-4 mb-2">
                              <span className="text-[10px] font-black text-[var(--accent)] bg-white border border-[var(--accent)]/10 px-2 py-0.5">{meal.time_label}</span>
                              <h4 className="font-bold text-[var(--ink)]">{meal.name}</h4>
                            </div>
                            <p className="text-xs text-[var(--soft-ink)]">{meal.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {meal.ingredients?.map((ing: string, i: number) => (
                                <span key={i} className="text-[9px] font-black text-[var(--muted)] uppercase bg-white px-2 py-0.5 border border-[rgba(47,44,40,0.05)]">{ing}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleEditMeal(meal)} className="p-2 text-[var(--muted)] hover:text-[var(--accent)] hover:bg-white border border-transparent hover:border-[rgba(47,44,40,0.1)]">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => deleteMeal(meal.id)} className="p-2 text-[var(--muted)] hover:text-red-500 hover:bg-white border border-transparent hover:border-[rgba(47,44,40,0.1)]">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={handleAddMeal}
                    className="w-full py-5 border-2 border-dashed border-[rgba(47,44,40,0.1)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em]"
                  >
                    <Plus size={20} /> ÖĞÜN EKLE
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
