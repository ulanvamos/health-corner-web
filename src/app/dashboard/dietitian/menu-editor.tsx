"use client";

import { useState, useEffect } from "react";
import { Edit2, Save, X, Utensils, Calendar, ChevronDown, ChevronUp, Copy, Check, Plus, Trash2, FileText, ChevronRight } from "lucide-react";
import { useDemoApp } from "@/components/demo-app-provider";
import { supabase } from "@/lib/supabase";

interface MenuEditorProps {
  clientId: string;
}

const DAYS_OF_WEEK = [
  "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"
];

export function MenuEditor({ clientId }: MenuEditorProps) {
  const { fetchData } = useDemoApp();
  
  const [menuDays, setMenuDays] = useState<any[]>([]);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealName, setMealName] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [mealDesc, setMealDesc] = useState("");
  const [mealIngredients, setMealIngredients] = useState("");

  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [allTemplates, setAllTemplates] = useState<any[]>([]);

  // Load client menu data
  useEffect(() => {
    loadMenu();
    loadAllTemplates();
  }, [clientId]);

  async function loadAllTemplates() {
    const { data } = await supabase.from('diet_templates').select('*');
    setAllTemplates(data || []);
  }

  async function applyTemplate(templateId: string) {
    if (!confirm("Bu şablonu uygularsanız danışanın mevcut menüsü TAMAMEN SİLİNECEKTİR. Devam etmek istiyor musunuz?")) return;
    
    setSaving(true);
    try {
      // 1. Load template full data
      const { data: template, error: tError } = await supabase
        .from('diet_templates')
        .select('*, days:diet_template_days(*, meals:diet_template_meals(*))')
        .eq('id', templateId)
        .single();
      
      if (tError) throw tError;

      // 2. Delete existing client menu (Meals will be deleted automatically due to CASCADE)
      const { error: delError } = await supabase
        .from('client_menu_days')
        .delete()
        .eq('client_id', clientId);
      
      if (delError) throw delError;

      // 3. Create new days and meals
      for (const tDay of template.days) {
        const { data: newDay, error: dError } = await supabase
          .from('client_menu_days')
          .insert({
            client_id: clientId,
            label: tDay.label,
            title: "Şablondan Uygulandı",
            note: "Diyetisyeniniz tarafından hazır şablon kullanılarak oluşturuldu.",
            sort_order: tDay.sort_order
          })
          .select()
          .single();
        
        if (dError) throw dError;

        if (tDay.meals && tDay.meals.length > 0) {
          const mealsToInsert = tDay.meals.map((m: any) => ({
            day_id: newDay.id,
            name: m.name,
            time_label: m.time_label,
            description: m.description,
            ingredients: m.ingredients,
            sort_order: m.sort_order
          }));
          await supabase.from('client_menu_meals').insert(mealsToInsert);
        }
      }

      setShowTemplatesModal(false);
      await loadMenu();
      alert("Şablon başarıyla uygulandı!");
    } catch (err) {
      console.error("Apply template error:", err);
    } finally {
      setSaving(false);
    }
  }

  async function loadMenu() {
    if (!clientId) return;
    setLoading(true);
    try {
      const { data: days, error } = await supabase
        .from('client_menu_days')
        .select('*, meals:client_menu_meals(*)')
        .eq('client_id', clientId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      // Tekrar eden günleri (Pazartesi-Pazartesi gibi) temizle
      const uniqueDays: any[] = [];
      const seenLabels = new Set();
      
      (days || []).forEach(day => {
        if (!seenLabels.has(day.label)) {
          seenLabels.add(day.label);
          uniqueDays.push({
            ...day,
            meals: (day.meals || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          });
        }
      });
      
      setMenuDays(uniqueDays);
    } catch (err) {
      console.error("Menu load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function initializeWeeklyMenu() {
    setSaving(true);
    try {
      // 1. Create 7 days
      const daysToInsert = DAYS_OF_WEEK.map((label, idx) => ({
        client_id: clientId,
        label: label,
        title: "Dengeli Beslenme",
        note: "Güne zinde bir başlangıç yapın.",
        sort_order: idx
      }));

      const { data: insertedDays, error: daysError } = await supabase
        .from('client_menu_days')
        .insert(daysToInsert)
        .select();

      if (daysError) throw daysError;

      // 2. Add default meals for each day
      for (const day of insertedDays) {
        const defaultMeals = [
          { day_id: day.id, name: "Kahvaltı", time_label: "08:30", description: "Protein ağırlıklı başlangıç", sort_order: 0 },
          { day_id: day.id, name: "Öğle Yemeği", time_label: "13:00", description: "Sebze ve lif dengeli öğün", sort_order: 1 },
          { day_id: day.id, name: "Ara Öğün", time_label: "16:00", description: "Sağlıklı atıştırmalık", sort_order: 2 },
          { day_id: day.id, name: "Akşam Yemeği", time_label: "19:30", description: "Hafif ve doyurucu kapanış", sort_order: 3 }
        ];
        await supabase.from('client_menu_meals').insert(defaultMeals);
      }

      await loadMenu();
    } catch (err) {
      console.error("Initialize error:", err);
    } finally {
      setSaving(false);
    }
  }

  async function cloneDayToAll(sourceDay: any) {
    if (!confirm(`${sourceDay.label} menüsünü haftanın diğer tüm günlerine kopyalamak istediğine emin misin?`)) return;
    
    setSaving(true);
    try {
      const otherDays = menuDays.filter(d => d.id !== sourceDay.id);
      
      for (const targetDay of otherDays) {
        // 1. Delete existing meals of target day
        await supabase.from('client_menu_meals').delete().eq('day_id', targetDay.id);
        
        // 2. Clone meals from source day
        const mealsToClone = sourceDay.meals.map((m: any) => ({
          day_id: targetDay.id,
          name: m.name,
          time_label: m.time_label,
          description: m.description,
          ingredients: m.ingredients,
          sort_order: m.sort_order
        }));
        
        if (mealsToClone.length > 0) {
          await supabase.from('client_menu_meals').insert(mealsToClone);
        }
      }
      
      await loadMenu();
      alert("Menü tüm haftaya başarıyla kopyalandı!");
    } catch (err) {
      console.error("Clone error:", err);
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
        .from('client_menu_meals')
        .update({
          name: mealName,
          time_label: mealTime,
          description: mealDesc,
          ingredients: mealIngredients.split("\n").map(i => i.trim()).filter(Boolean)
        })
        .eq('id', mealId);

      if (error) throw error;
      setEditingMealId(null);
      await loadMenu();
    } catch (err) {
      console.error("Save meal error:", err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteMeal(mealId: string) {
    if (!confirm("Bu öğünü silmek istediğine emin misin?")) return;
    try {
      await supabase.from('client_menu_meals').delete().eq('id', mealId);
      await loadMenu();
    } catch (err) {
      console.error("Delete meal error:", err);
    }
  }

  if (loading) return <div className="py-8 text-center animate-pulse text-[var(--muted)]">Menü yükleniyor...</div>;

  if (menuDays.length === 0) {
    return (
      <section className="border-t border-[rgba(47,44,40,0.08)] pt-8 mt-8">
        <div className="bg-emerald-50 border border-emerald-100 p-12 text-center">
          <Utensils size={48} className="text-[var(--accent)] mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-[var(--ink)] mb-2">Haftalık Menü Henüz Hazırlanmamış</h2>
          <p className="text-sm text-[var(--soft-ink)] mb-6 max-w-md mx-auto">
            Bu danışan için haftalık bir diyet programı bulunmuyor. Hemen 7 günlük bir taslak oluşturarak başlayabilirsiniz.
          </p>
          <button 
            disabled={saving}
            onClick={initializeWeeklyMenu}
            className="bg-[var(--accent)] text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#24794e] shadow-lg shadow-emerald-200"
          >
            {saving ? "Oluşturuluyor..." : "Haftalık Program Başlat"}
          </button>
        </div>
      </section>
    );
  }

  const activeDay = menuDays[activeDayIdx];

  return (
    <section className="border-t border-[rgba(47,44,40,0.08)] pt-8 mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="text-[var(--accent)]" size={20} />
          <h2 className="text-xl font-bold text-[var(--ink)] tracking-tight">Haftalık Diyet Programı</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowTemplatesModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-600 border border-amber-600 hover:bg-amber-50 transition-colors"
          >
            <FileText size={14} />
            HAZIR ŞABLON UYGULA
          </button>
          <button 
            onClick={() => cloneDayToAll(activeDay)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] border border-[var(--accent)] hover:bg-emerald-50 transition-colors"
          >
            <Copy size={14} />
            BU GÜNÜ TÜM HAFTAYA KOPYALA
          </button>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-[rgba(47,44,40,0.08)] flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-black text-[var(--ink)]">Şablon Seçin</h3>
                <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest mt-1">Hazır diyet listelerinden birini seçin</p>
              </div>
              <button onClick={() => setShowTemplatesModal(false)} className="p-2 hover:bg-white border border-transparent hover:border-[rgba(47,44,40,0.1)] transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
              {allTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-sm text-[var(--muted)] font-bold">Henüz hiç şablon oluşturmamışsınız.</p>
                  <a href="/dashboard/dietitian/templates" className="text-[var(--accent)] text-xs font-bold underline mt-2 inline-block">Şablon oluşturmaya git</a>
                </div>
              ) : (
                allTemplates.map(t => (
                  <div 
                    key={t.id} 
                    className="group p-6 border border-[rgba(47,44,40,0.08)] hover:border-[var(--accent)] cursor-pointer transition-all flex justify-between items-center bg-white hover:shadow-lg"
                    onClick={() => applyTemplate(t.id)}
                  >
                    <div>
                      <h4 className="font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">{t.name}</h4>
                      <p className="text-xs text-[var(--soft-ink)] mt-1">{t.description}</p>
                    </div>
                    <ChevronRight size={20} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-all" />
                  </div>
                ))
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t border-[rgba(47,44,40,0.08)] flex justify-end">
               <button 
                 onClick={() => setShowTemplatesModal(false)}
                 className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)] border border-[rgba(47,44,40,0.1)] bg-white hover:bg-gray-50"
               >
                 İPTAL
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Week Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {menuDays.map((day, idx) => (
          <button
            key={day.id}
            onClick={() => { setActiveDayIdx(idx); setEditingMealId(null); }}
            className={`px-6 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
              activeDayIdx === idx 
                ? "border-[var(--accent)] text-[var(--accent)] bg-emerald-50/50" 
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Active Day Content */}
      <div className="bg-white border border-[rgba(47,44,40,0.08)] p-8 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="mb-8 border-b border-[rgba(47,44,40,0.06)] pb-4 flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-bold text-[var(--ink)]">{activeDay.label} Menüsü</h3>
            <p className="text-sm text-[var(--soft-ink)] mt-1 italic">"{activeDay.note}"</p>
          </div>
          <div className="text-[var(--accent)] font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
            {activeDay.meals.length} Öğün Planlandı
          </div>
        </div>

        <div className="space-y-6">
          {activeDay.meals.map((meal: any) => (
            <div key={meal.id} className={`group border-l-4 ${editingMealId === meal.id ? "border-amber-400 bg-amber-50/20" : "border-[var(--accent)] bg-gray-50/30"} p-6 transition-all relative`}>
              {editingMealId === meal.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-[150px_1fr] gap-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-2 block">Saat</label>
                      <input 
                        value={mealTime} 
                        onChange={e => setMealTime(e.target.value)} 
                        className="w-full border border-[rgba(47,44,40,0.1)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] bg-white" 
                        placeholder="Örn: 08:30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-2 block">Öğün Adı</label>
                      <input 
                        value={mealName} 
                        onChange={e => setMealName(e.target.value)} 
                        className="w-full border border-[rgba(47,44,40,0.1)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] bg-white" 
                        placeholder="Örn: Sabah Kahvaltısı"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-2 block">Kısa Açıklama / Not</label>
                    <input 
                      value={mealDesc} 
                      onChange={e => setMealDesc(e.target.value)} 
                      className="w-full border border-[rgba(47,44,40,0.1)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] bg-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-2 block">İçerikler (Her malzemeyi yeni satıra yazın)</label>
                    <textarea 
                      value={mealIngredients} 
                      onChange={e => setMealIngredients(e.target.value)} 
                      rows={4} 
                      className="w-full border border-[rgba(47,44,40,0.1)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] bg-white" 
                      placeholder="2 adet yumurta&#10;1 dilim tam buğday ekmeği&#10;Beyaz peynir"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      disabled={saving}
                      onClick={() => handleSaveMeal(meal.id)} 
                      className="bg-[var(--accent)] text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#24794e] flex items-center gap-2"
                    >
                      {saving ? "Kaydediliyor..." : <><Save size={14} /> GÜNCELLE VE KAYDET</>}
                    </button>
                    <button 
                      onClick={() => setEditingMealId(null)} 
                      className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)] border border-[rgba(47,44,40,0.1)] bg-white hover:bg-gray-50"
                    >
                      İPTAL
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="px-3 py-1 bg-white border border-[rgba(47,44,40,0.1)] rounded font-black text-xs text-[var(--accent)]">
                        {meal.time_label}
                      </div>
                      <h4 className="text-lg font-bold text-[var(--ink)]">{meal.name}</h4>
                    </div>
                    <p className="text-sm text-[var(--soft-ink)] leading-relaxed mb-4">{meal.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {meal.ingredients && meal.ingredients.map((ing: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-white px-3 py-1.5 border border-[rgba(47,44,40,0.06)] text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/40" />
                          {ing}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditMeal(meal)} 
                      className="p-2 text-[var(--muted)] hover:text-[var(--accent)] hover:bg-white border border-transparent hover:border-[rgba(47,44,40,0.1)] transition-all"
                      title="Düzenle"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteMeal(meal.id)}
                      className="p-2 text-[var(--muted)] hover:text-red-500 hover:bg-white border border-transparent hover:border-[rgba(47,44,40,0.1)] transition-all"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <button className="w-full py-4 border-2 border-dashed border-[rgba(47,44,40,0.1)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest">
            <Plus size={18} /> YENİ ÖĞÜN EKLE
          </button>
        </div>
      </div>
    </section>
  );
}
