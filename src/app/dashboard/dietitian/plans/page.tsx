"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  User,
  Activity,
  TrendingDown,
  TrendingUp,
  Minus,
  Scale,
  Ruler,
  Heart,
  AlertTriangle,
  Target,
  Calendar,
  ChevronRight,
} from "lucide-react";

import { useDemoApp } from "@/components/demo-app-provider";
import { PlanEditor } from "../plan-editor";
import { MenuEditor } from "../menu-editor";
import { ClientStatistics } from "@/components/client-statistics";

import { Suspense } from "react";

function DietitianPlansContent() {
  const { state, isSeeded } = useDemoApp();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [activeTab, setActiveTab] = useState<"summary" | "diet" | "stats" | "history">("summary");

  // URL'den gelen clientId'yi otomatik seç
  useEffect(() => {
    const urlClientId = searchParams.get("clientId");
    if (urlClientId && state.clients.some(c => c.id === urlClientId)) {
      setSelectedClientId(urlClientId);
    }
  }, [searchParams, state.clients]);

  // Memoize: Aranabilir danışan listesi
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return state.clients;
    const q = searchQuery.toLowerCase();
    return state.clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.goalLabel?.toLowerCase().includes(q)
    );
  }, [state.clients, searchQuery]);

  // Seçili danışan
  const selectedClient = useMemo(
    () => state.clients.find((c) => c.id === selectedClientId) || null,
    [state.clients, selectedClientId]
  );

  if (!isSeeded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-pulse">
        <div className="text-[var(--muted)] font-bold uppercase tracking-[0.3em]">Planlar Yükleniyor...</div>
      </div>
    );
  }

  // BMI hesaplama
  function calcBMI(weightKg: number, heightCm: number) {
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
  }

  function bmiCategory(bmi: number) {
    if (bmi < 18.5) return { label: "Zayıf", color: "text-blue-600", bg: "bg-blue-50" };
    if (bmi < 25) return { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (bmi < 30) return { label: "Fazla Kilolu", color: "text-amber-600", bg: "bg-amber-50" };
    return { label: "Obez", color: "text-red-600", bg: "bg-red-50" };
  }

  function goalIcon(goalType: string) {
    if (goalType === "lose_weight") return <TrendingDown size={16} className="text-blue-500" />;
    if (goalType === "gain_weight") return <TrendingUp size={16} className="text-orange-500" />;
    return <Minus size={16} className="text-gray-500" />;
  }

  function goalLabel(goalType: string) {
    if (goalType === "lose_weight") return "Kilo Verme";
    if (goalType === "gain_weight") return "Kilo Alma";
    return "Kilo Koruma";
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)] sm:text-3xl tracking-tight">Diyet Listesi Hazırla</h1>
        <p className="mt-1 text-sm text-[var(--soft-ink)]">Danışan seçip detaylarını incele, plan ve menüsünü düzenle</p>
      </div>

      {/* Danışan Seçici — Arama + Liste */}
      <section className="bg-white border border-[rgba(47,44,40,0.08)] shadow-sm">
        <div className="p-5 border-b border-[rgba(47,44,40,0.06)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Danışan ara (isim, e-posta veya hedef)..."
              className="w-full pl-10 pr-4 py-3 text-sm outline-none border border-[rgba(47,44,40,0.1)] focus:border-[var(--accent)] transition-colors bg-[rgba(223,240,228,0.08)]"
            />
          </div>
        </div>

        {/* Danışan Listesi */}
        <div className="max-h-[280px] overflow-y-auto divide-y divide-[rgba(47,44,40,0.04)]">
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--muted)]">Danışan bulunamadı.</div>
          ) : (
            filteredClients.map((client) => {
              const isActive = client.id === selectedClientId;
              const lastWeight = client.measurements?.[0]?.weight;
              const bmi = lastWeight ? calcBMI(lastWeight, client.heightCm) : null;

              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all ${
                    isActive
                      ? "bg-[rgba(223,240,228,0.5)] border-l-4 border-l-[var(--accent)]"
                      : "hover:bg-[rgba(223,240,228,0.12)] border-l-4 border-l-transparent"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isActive ? "bg-[var(--accent)] text-white" : "bg-[var(--accent-soft)] text-[var(--accent)]"
                  }`}>
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold truncate ${isActive ? "text-[var(--accent)]" : "text-[var(--ink)]"}`}>
                        {client.name}
                      </p>
                      {goalIcon(client.goalType)}
                    </div>
                    <p className="text-[11px] text-[var(--soft-ink)] truncate">{client.goalLabel || goalLabel(client.goalType)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {bmi && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${bmiCategory(parseFloat(bmi)).bg} ${bmiCategory(parseFloat(bmi)).color}`}>
                        BMI {bmi}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={16} className={`shrink-0 ${isActive ? "text-[var(--accent)]" : "text-[var(--muted)]"}`} />
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Seçili Danışan Yoksa */}
      {!selectedClient && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-[rgba(47,44,40,0.04)] rounded-full flex items-center justify-center text-[var(--muted)] mb-4">
            <User size={32} />
          </div>
          <h2 className="text-lg font-bold text-[var(--ink)] mb-2">Danışan Seçin</h2>
          <p className="text-sm text-[var(--muted)] max-w-sm">Yukarıdan bir danışan seçerek detaylı bilgilerine ulaşabilir ve diyet planını hazırlayabilirsiniz.</p>
        </div>
      )}

      {/* Danışan Detay Alanı */}
      {selectedClient && (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-[rgba(47,44,40,0.04)] p-1 rounded-xl w-fit">
            {[
              { id: 'summary', label: 'Özet', icon: User },
              { id: 'diet', label: 'Diyet Planı', icon: Target },
              { id: 'stats', label: 'İstatistikler', icon: Activity },
              { id: 'history', label: 'Geçmiş', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-lg ${
                  activeTab === tab.id 
                    ? "bg-white text-[var(--accent)] shadow-sm" 
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Sol: Genel Bilgiler + Anamnez */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profil Kartı */}
              <div className="bg-[var(--accent)] text-white p-6 shadow-lg shadow-[var(--accent)]/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{selectedClient.name}</h3>
                    <p className="text-xs text-white/70">{selectedClient.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/20">
                  <div className="text-center">
                    <p className="text-xl font-bold">{selectedClient.age || "—"}</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/60">Yaş</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{selectedClient.heightCm || "—"}</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/60">Boy (cm)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {selectedClient.measurements?.[0]?.weight || "—"}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-white/60">Kilo (kg)</p>
                  </div>
                </div>
              </div>

              {/* BMI Kartı */}
              {(() => {
                const lastWeight = selectedClient.measurements?.[0]?.weight;
                const bmi = lastWeight ? calcBMI(lastWeight, selectedClient.heightCm) : null;
                if (!bmi) return null;
                const cat = bmiCategory(parseFloat(bmi));
                return (
                  <div className={`p-4 border ${cat.bg} flex items-center gap-4`}>
                    <Scale size={24} className={cat.color} />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Vücut Kitle İndeksi</p>
                      <p className={`text-2xl font-bold ${cat.color}`}>{bmi}</p>
                      <p className={`text-xs font-bold ${cat.color}`}>{cat.label}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Hedef */}
              <div className="bg-white border border-[rgba(47,44,40,0.08)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-[var(--accent)]" />
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Hedef</p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {goalIcon(selectedClient.goalType)}
                  <p className="text-sm font-bold text-[var(--ink)]">{goalLabel(selectedClient.goalType)}</p>
                </div>
                {selectedClient.targetSummary && (
                  <p className="text-xs text-[var(--soft-ink)] leading-relaxed">{selectedClient.targetSummary}</p>
                )}
              </div>

              {/* Sağlık Bilgileri (Anamnez) */}
              <div className="bg-white border border-[rgba(47,44,40,0.08)] p-4 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={16} className="text-red-400" />
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Sağlık Bilgileri</p>
                </div>

                {/* Alerjiler */}
                {selectedClient.allergies?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-1.5">Alerjiler</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedClient.allergies.map((a, i) => (
                        <span key={i} className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 border border-red-100">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kronik Hastalıklar */}
                {selectedClient.chronicConditions?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-1.5">Kronik Hastalıklar</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedClient.chronicConditions.map((c, i) => (
                        <span key={i} className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 border border-amber-100">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alerjisi/hastalığı yoksa */}
                {(!selectedClient.allergies || selectedClient.allergies.length === 0) &&
                 (!selectedClient.chronicConditions || selectedClient.chronicConditions.length === 0) && (
                  <p className="text-xs text-[var(--soft-ink)] italic">Bilinen alerji veya kronik hastalık bulunmuyor.</p>
                )}
              </div>

              {/* Anamnez Detayları — Yaşam Tarzı & Beslenme */}
              {selectedClient.anamnesis && (
                <div className="bg-white border border-[rgba(47,44,40,0.08)] p-4 space-y-3">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--accent)] mb-2">📋 Anamnez Detayları</p>

                  {selectedClient.anamnesis.diseases && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Hastalıklar</p>
                      <p className="text-xs text-[var(--ink)] mt-0.5">{selectedClient.anamnesis.diseases}</p>
                    </div>
                  )}
                  {selectedClient.anamnesis.medications && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">İlaçlar</p>
                      <p className="text-xs text-[var(--ink)] mt-0.5">{selectedClient.anamnesis.medications}</p>
                    </div>
                  )}
                  {selectedClient.anamnesis.smoke_alcohol && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Sigara / Alkol</p>
                      <p className="text-xs text-[var(--ink)] mt-0.5">{selectedClient.anamnesis.smoke_alcohol}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[rgba(47,44,40,0.06)]">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Uyku</p>
                      <p className="text-sm font-bold text-[var(--ink)]">{selectedClient.anamnesis.sleep_hours ?? "—"} saat</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Aktivite</p>
                      <p className="text-sm font-bold text-[var(--ink)]">
                        {selectedClient.anamnesis.activity_level === 'sedentary' ? 'Hareketsiz' : 
                         selectedClient.anamnesis.activity_level === 'moderate' ? 'Orta' : 
                         selectedClient.anamnesis.activity_level === 'active' ? 'Aktif' : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Günlük Öğün</p>
                      <p className="text-sm font-bold text-[var(--ink)]">{selectedClient.anamnesis.daily_meals ?? "—"} öğün</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Hedef Kilo</p>
                      <p className="text-sm font-bold text-[var(--accent)]">{selectedClient.anamnesis.target_weight ?? "—"} kg</p>
                    </div>
                  </div>
                  {(selectedClient.anamnesis.favorite_foods || selectedClient.anamnesis.disliked_foods) && (
                    <div className="pt-2 border-t border-[rgba(47,44,40,0.06)] space-y-2">
                      {selectedClient.anamnesis.favorite_foods && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Sevdiği Yiyecekler</p>
                          <p className="text-xs text-[var(--ink)] mt-0.5">{selectedClient.anamnesis.favorite_foods}</p>
                        </div>
                      )}
                      {selectedClient.anamnesis.disliked_foods && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Sevmediği Yiyecekler</p>
                          <p className="text-xs text-[var(--ink)] mt-0.5">{selectedClient.anamnesis.disliked_foods}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedClient.anamnesis.motivation_reason && (
                    <div className="pt-2 border-t border-[rgba(47,44,40,0.06)]">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Motivasyon</p>
                      <p className="text-xs text-[var(--ink)] mt-0.5 italic">"{selectedClient.anamnesis.motivation_reason}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* İçerik Değişimi */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'summary' && (
                <>
                  {/* İlerleme Durumu */}
                  <div className="bg-white border border-[rgba(47,44,40,0.08)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity size={18} className="text-[var(--accent)]" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">İlerleme Durumu</h3>
                    </div>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex-1">
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[var(--accent)] to-emerald-400 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(selectedClient.progressPercent || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-lg font-bold text-[var(--ink)]">%{selectedClient.progressPercent || 0}</span>
                    </div>
                  </div>

                  {/* Ölçüm Geçmişi Tablosu */}
                  <div className="bg-white border border-[rgba(47,44,40,0.08)]">
                    <div className="p-5 border-b border-[rgba(47,44,40,0.06)] flex items-center gap-2">
                      <Ruler size={18} className="text-[var(--accent)]" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Ölçüm Geçmişi</h3>
                    </div>

                    {(!selectedClient.measurements || selectedClient.measurements.length === 0) ? (
                      <div className="p-8 text-center">
                        <Scale size={32} className="text-[var(--muted)] opacity-30 mx-auto mb-3" />
                        <p className="text-sm text-[var(--muted)]">Henüz ölçüm verisi girilmemiş.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[rgba(47,44,40,0.06)]">
                              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Tarih</th>
                              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Kilo (kg)</th>
                              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Bel (cm)</th>
                              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Değişim</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedClient.measurements.slice(0, 5).map((m, idx) => {
                              const prevWeight = selectedClient.measurements[idx + 1]?.weight;
                              const diff = prevWeight ? (m.weight - prevWeight).toFixed(1) : null;
                              return (
                                <tr key={m.id || idx} className="border-b border-[rgba(47,44,40,0.04)]">
                                  <td className="px-5 py-3 font-medium text-[var(--ink)]">{m.date}</td>
                                  <td className="px-5 py-3 font-bold text-[var(--ink)]">{m.weight ?? "—"}</td>
                                  <td className="px-5 py-3 text-[var(--soft-ink)]">{m.waist ?? "—"}</td>
                                  <td className="px-5 py-3">
                                    {diff !== null && (
                                      <span className={`text-xs font-bold ${parseFloat(diff) < 0 ? "text-emerald-600" : "text-red-500"}`}>
                                        {parseFloat(diff) > 0 ? "+" : ""}{diff} kg
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'diet' && (
                <div className="space-y-6">
                  <MenuEditor clientId={selectedClientId} />
                </div>
              )}

              {activeTab === 'stats' && (
                <ClientStatistics client={selectedClient} />
              )}

              {activeTab === 'history' && (
                <div className="bg-white border border-[rgba(47,44,40,0.08)] p-12 text-center">
                  <Calendar size={48} className="text-[var(--muted)] opacity-20 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[var(--ink)]">Plan Arşivi</h3>
                  <p className="text-sm text-[var(--muted)] max-w-xs mx-auto mt-2">
                    Bu danışan için geçmiş haftalara ait diyet listeleri burada listelenecektir.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function DietitianPlansPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh] animate-pulse">
        <div className="text-[var(--muted)] font-bold uppercase tracking-[0.3em]">Sayfa Yükleniyor...</div>
      </div>
    }>
      <DietitianPlansContent />
    </Suspense>
  );
}
