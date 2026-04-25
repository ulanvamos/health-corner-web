"use client";

import { useState } from "react";
import { Edit2, Save, X, ClipboardList, Plus } from "lucide-react";
import { useDemoApp } from "@/components/demo-app-provider";

interface PlanEditorProps {
  clientId: string;
}

export function PlanEditor({ clientId }: PlanEditorProps) {
  const { workspace, upsertPlanSection } = useDemoApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [emphasis, setEmphasis] = useState("");
  const [status, setStatus] = useState<"active" | "next" | "watch">("active");
  const [saving, setSaving] = useState(false);

  function handleEditClick(section: any) {
    setEditingId(section.id);
    setTitle(section.title);
    setSummary(section.summary);
    setEmphasis(section.emphasis);
    setStatus(section.status);
  }

  async function handleSave(id?: string, originalBullets: string[] = []) {
    setSaving(true);
    try {
      await upsertPlanSection({
        id,
        clientId,
        title,
        summary,
        emphasis,
        status,
        bullets: originalBullets,
      });
      setEditingId(null);
      setIsAdding(false);
      // Reset fields
      setTitle("");
      setSummary("");
      setEmphasis("");
    } finally {
      setSaving(false);
    }
  }

  if (!workspace?.planSections) return null;

  return (
    <section className="border-t border-[rgba(47,44,40,0.08)] pt-8 mt-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-[var(--accent)]" size={18} />
          <h2 className="text-xl font-bold text-[var(--ink)] tracking-tight">Plan Bölümleri</h2>
        </div>
        {!isAdding && (
          <button 
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setTitle(""); setSummary(""); setEmphasis("");
            }}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
          >
            <Plus size={14} /> Yeni Bölüm Ekle
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Add New Section Form */}
        {isAdding && (
          <div className="bg-gray-50/50 p-6 border border-dashed border-[rgba(47,44,40,0.1)] mb-8 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--ink)] mb-4">Yeni Bölüm Hazırla</h3>
            <div className="grid gap-4">
              <input 
                placeholder="Başlık (Örn: Karbonhidrat Dengesi)"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full bg-white border border-[rgba(47,44,40,0.1)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" 
              />
              <textarea 
                placeholder="Bu bölüm hakkında detaylı özet..."
                value={summary} 
                onChange={(e) => setSummary(e.target.value)} 
                className="w-full bg-white border border-[rgba(47,44,40,0.1)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" 
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setIsAdding(false)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Vazgeç</button>
              <button 
                onClick={() => handleSave()} 
                disabled={saving || !title}
                className="bg-[var(--accent)] text-white px-8 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#24794e]"
              >
                {saving ? "Kaydediliyor..." : "Bölümü Oluştur"}
              </button>
            </div>
          </div>
        )}

        {workspace.planSections.map((section) => (
          <div key={section.id} className="bg-white border border-[rgba(47,44,40,0.06)] p-6 hover:shadow-md transition-all">
            {editingId === section.id ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-1.5 block">Başlık</label>
                    <input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      className="w-full rounded-none border border-[rgba(47,44,40,0.1)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] bg-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-1.5 block">Durum</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full rounded-none border border-[rgba(47,44,40,0.1)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] bg-white"
                    >
                      <option value="active">Aktif</option>
                      <option value="next">Sıradaki</option>
                      <option value="watch">İzle</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-1.5 block">Özet Açıklama</label>
                  <textarea 
                    value={summary} 
                    onChange={(e) => setSummary(e.target.value)} 
                    className="w-full rounded-none border border-[rgba(47,44,40,0.1)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] bg-white" 
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button 
                    disabled={saving}
                    onClick={() => handleSave(section.id, section.bullets)} 
                    className="bg-[var(--accent)] text-white px-8 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#24794e] flex items-center gap-2"
                  >
                    <Save size={14} /> {saving ? "Kaydediliyor..." : "Güncelle"}
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--muted)] border border-[rgba(47,44,40,0.1)]">İptal</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-[var(--ink)] leading-tight">{section.title}</h3>
                    <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 border ${
                      section.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                      section.status === "next" ? "bg-amber-50 text-amber-700 border-amber-100" : 
                      "bg-gray-50 text-[var(--muted)] border-gray-100"
                    }`}>
                      {section.status === "active" ? "Aktif" : section.status === "next" ? "Sıradaki" : "İzle"}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--soft-ink)] leading-relaxed">{section.summary}</p>
                  {section.emphasis && (
                    <p className="mt-3 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">
                      Vurgu: {section.emphasis}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => handleEditClick(section)}
                  className="p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors border border-transparent hover:border-[rgba(47,44,40,0.1)]"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
