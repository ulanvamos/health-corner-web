"use client";

import { useState, useEffect } from "react";
import { CalendarRange, Check, X, Clock, Calendar } from "lucide-react";
import { useDemoApp } from "@/components/demo-app-provider";
import type { AppointmentMode } from "@/lib/demo-data";

export default function DietitianAppointmentsPage() {
  const { state, updateAppointmentStatus, currentProfile } = useDemoApp();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});

  // Pre-fill preferred dates when appointments load
  useEffect(() => {
    const initial: Record<string, string> = {};
    state.appointments.forEach(a => {
      if (a.preferred_at && a.status === 'pending') {
        const d = new Date(a.preferred_at);
        initial[`${a.id}_date`] = d.toISOString().split('T')[0];
        initial[`${a.id}_time`] = d.toTimeString().slice(0, 5);
      }
    });
    setSelectedDates(initial);
  }, [state.appointments]);

  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleAction = async (id: string, status: 'approved' | 'canceled', mode: string) => {
    setProcessingId(id);
    try {
      const date = selectedDates[`${id}_date`];
      const time = selectedDates[`${id}_time`];
      const updates: {
        mode: AppointmentMode;
        scheduled_at?: string;
        time_label?: string;
        dietitian_user_id?: string;
        cancellation_reason?: string;
      } = { mode: mode as AppointmentMode };
      
      if (status === 'approved') {
        if (!date || !time) {
          alert("Lütfen önce takvimden GÜN ve SAAT seçin!");
          setProcessingId(null);
          return;
        }
        const fullDateTime = new Date(`${date}T${time}`);
        updates.scheduled_at = fullDateTime.toISOString();
        updates.time_label = fullDateTime.toLocaleString('tr-TR', { 
          day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
        });
        
        // Eğer randevu boşta ise, kabul eden diyetisyene ata
        const currentApp = state.appointments.find(a => a.id === id);
        if (!currentApp?.dietitianId || currentApp.dietitianId === "") {
          updates.dietitian_user_id = currentProfile?.id;
        }
      } else if (status === 'canceled') {
        // Red sebebi artık zorunlu değil
        updates.cancellation_reason = rejectionReason;
      }

      await updateAppointmentStatus(id, status, updates);
      setRejectionModalId(null);
      setRejectionReason("");
    } catch (err: any) {
      console.error("İşlem başarısız:", err);
      alert("HATA: " + (err.message || "İşlem tamamlanamadı"));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-[var(--ink)] tracking-tighter">Randevular</h1>
          <p className="text-[var(--soft-ink)] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Aktif talepleri ve planlanmış görüşmeleri yönetin
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/80 backdrop-blur-md border border-white shadow-xl shadow-gray-200/20 px-6 py-4 rounded-[2rem] flex items-center gap-4">
             <div className="p-3 bg-amber-50 rounded-2xl">
               <Clock size={20} className="text-amber-600" />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Bekleyen</p>
               <p className="text-xl font-black text-[var(--ink)]">
                 {state.appointments.filter(a => 
                   a.status === 'pending' && 
                   (a.dietitianId === currentProfile?.id || !a.dietitianId || a.dietitianId === "")
                 ).length}
               </p>
             </div>
          </div>
        </div>
      </div>

      {state.appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-sm border-2 border-dashed border-gray-100 rounded-[3rem]">
          <CalendarRange size={64} className="text-[var(--muted)] opacity-5 mb-6" />
          <p className="text-sm font-black text-[var(--muted)] uppercase tracking-[0.3em]">Talep listesi temiz</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Custom Header */}
          <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1.2fr] px-10 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)] opacity-60">
            <span>Danışan Bilgisi</span>
            <span>Tür</span>
            <span>Görüşme Zamanı</span>
            <span>Durum</span>
            <span className="text-right">İşlem</span>
          </div>

          <div className="space-y-4">
            {state.appointments
              .filter(a => a.dietitianId === currentProfile?.id || !a.dietitianId || a.dietitianId === "")
              .map((item) => (
              <div
                key={item.id}
                className={`group relative bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] rounded-[2.5rem] p-8 transition-all duration-500 ${processingId === item.id ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1.2fr] items-center gap-6">
                  {/* Client Info */}
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-tr from-gray-50 to-white flex items-center justify-center text-2xl font-black text-emerald-600 border border-gray-100 shadow-sm transition-transform duration-500 group-hover:scale-110">
                        {item.clientName.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-black text-[var(--ink)] tracking-tight truncate">{item.clientName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          {item.mode === 'online' ? '🌐 ONLINE' : '🏢 KLİNİK'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <p className="text-xs font-black text-[var(--soft-ink)] uppercase tracking-tighter opacity-80">
                      {item.type_label || "Görüşme"}
                    </p>
                  </div>

                  {/* Scheduling */}
                  <div>
                    {item.status === 'pending' ? (
                      <div className="flex flex-col gap-2 max-w-[200px]">
                        <input 
                          type="date"
                          value={selectedDates[`${item.id}_date`] || ""}
                          onChange={(e) => setSelectedDates(prev => ({ ...prev, [`${item.id}_date`]: e.target.value }))}
                          className="text-[11px] font-black border-2 border-gray-50/50 rounded-2xl px-4 py-2.5 outline-none bg-gray-50/30 focus:bg-white focus:border-emerald-200 transition-all shadow-inner"
                        />
                        <input 
                          type="time"
                          value={selectedDates[`${item.id}_time`] || ""}
                          onChange={(e) => setSelectedDates(prev => ({ ...prev, [`${item.id}_time`]: e.target.value }))}
                          className="text-[11px] font-black border-2 border-gray-50/50 rounded-2xl px-4 py-2.5 outline-none bg-gray-50/30 focus:bg-white focus:border-emerald-200 transition-all shadow-inner"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gray-50 rounded-xl">
                          <Calendar size={16} className="text-[var(--muted)]" />
                        </div>
                        <p className="text-sm font-black text-[var(--ink)] tracking-tighter">
                          {item.time_label || "Zaman Belirlenmedi"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 ${
                      item.status === "pending" ? "bg-amber-50/50 text-amber-600 border-amber-100/50" 
                      : item.status === "approved" ? "bg-emerald-50/50 text-emerald-600 border-emerald-100/50" 
                      : item.status === "completed" ? "bg-gray-50 text-gray-400 border-gray-100/50" 
                      : "bg-red-50/50 text-red-600 border-red-100/50"
                    }`}>
                      {item.status === "pending" ? "Beklemede" : item.status === "approved" ? "Onaylandı" : item.status === "completed" ? "Tamamlandı" : "İptal"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                    {item.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleAction(item.id, 'approved', item.mode)}
                          className="group/btn flex items-center gap-2 px-6 py-4 bg-[var(--ink)] text-white rounded-[1.8rem] hover:bg-emerald-600 active:scale-95 transition-all duration-300 shadow-xl shadow-gray-200/50 text-[11px] font-black tracking-widest"
                        >
                          <Check size={18} strokeWidth={3} className="transition-transform group-hover/btn:scale-125" />
                          ONAYLA
                        </button>
                        <button 
                          onClick={() => setRejectionModalId(item.id)}
                          className="p-4 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-[1.8rem] transition-all duration-300 border-2 border-transparent hover:border-red-100 active:scale-90"
                        >
                          <X size={24} strokeWidth={3} />
                        </button>
                      </>
                    )}
                    {item.status === 'approved' && (
                      <button 
                        onClick={() => updateAppointmentStatus(item.id, 'completed')}
                        className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-white border-2 border-gray-100 text-[var(--muted)] hover:text-emerald-600 hover:border-emerald-100 rounded-2xl transition-all duration-300 active:scale-95"
                      >
                        Tamamla
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modern Rejection Modal */}
      {rejectionModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[var(--ink)]/40 backdrop-blur-sm" onClick={() => setRejectionModalId(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl border border-white p-10 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                  <X size={32} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black text-[var(--ink)] tracking-tighter mt-4">Talebi Reddet</h3>
                <p className="text-sm font-semibold text-[var(--soft-ink)]">Danışana neden onaylayamadığınızı açıklayın</p>
              </div>
              <button onClick={() => setRejectionModalId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-[var(--muted)]" />
              </button>
            </div>

            <textarea 
              autoFocus
              placeholder="Örn: O gün klinikte olmayacağım, lütfen sonraki hafta için randevu talep edin."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full h-32 p-6 text-sm font-bold bg-gray-50 border-2 border-gray-50 rounded-3xl outline-none focus:bg-white focus:border-red-100 transition-all resize-none italic"
            />

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setRejectionModalId(null)}
                className="flex-1 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[var(--muted)] hover:bg-gray-100 rounded-2xl transition-colors"
              >
                Vazgeç
              </button>
              <button 
                onClick={() => handleAction(rejectionModalId, 'canceled', 'online')}
                className="flex-1 px-6 py-4 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-200"
              >
                REDDİ ONAYLA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
