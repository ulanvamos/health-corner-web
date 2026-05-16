"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Activity, 
  ClipboardList, 
  TrendingUp, 
  History,
  Scale,
  Ruler,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useDemoApp } from "@/components/demo-app-provider";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ClientDetailPage() {
  const { id } = useParams();
  const { state, isSeeded } = useDemoApp();
  const [anamnesis, setAnamnesis] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const client = state.clients.find(c => c.id === id);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setIsLoadingData(true);
      try {
        // Fetch anamnesis
        const { data: anaData } = await supabase
          .from('anamnesis')
          .select('*')
          .eq('client_id', id)
          .maybeSingle();
        setAnamnesis(anaData);

        // Fetch measurements
        const { data: measData } = await supabase
          .from('measurements')
          .select('*')
          .eq('client_id', id)
          .order('measured_at', { ascending: false });
        setMeasurements(measData || []);
      } catch (err) {
        console.error("Error fetching analysis data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchData();
  }, [id]);

  if (!isSeeded || !client) {
    return <div className="p-12 text-center text-[var(--muted)]">Danışan bulunamadı.</div>;
  }

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <header className="mb-12">
        <Link href="/dashboard/dietitian/clients" className="inline-flex items-center gap-2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest hover:text-[var(--accent)] transition-colors mb-6">
          <ArrowLeft size={14} /> Danışan Listesi
        </Link>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] text-2xl font-bold border border-[var(--accent)]/10 shadow-sm">
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--ink)] tracking-tight">{client.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                 <span className="text-[10px] font-bold bg-gray-50 text-[var(--muted)] px-2 py-0.5 rounded border border-[rgba(47,44,40,0.06)] uppercase tracking-widest">{client.email}</span>
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">AKTİF DANIŞAN</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <button className="px-6 py-2.5 border border-[rgba(47,44,40,0.1)] rounded-full text-xs font-bold text-[var(--ink)] hover:bg-gray-50 transition-all">Dosyayı Düzenle</button>
             <button className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-full text-xs font-bold shadow-lg shadow-[var(--accent)]/20 hover:scale-105 transition-all">Diyet Yaz</button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Analysis & Data (2/3) */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* Quick Stats Grid */}
          <section className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">
             <div className="p-6 bg-white border border-[rgba(47,44,40,0.06)] rounded-3xl">
                <Scale size={18} className="text-[var(--accent)] mb-4" />
                <p className="text-2xl font-bold text-[var(--ink)]">{measurements[0]?.weight_kg || "-"} <span className="text-xs font-normal text-[var(--muted)]">kg</span></p>
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Güncel Kilo</p>
             </div>
             <div className="p-6 bg-white border border-[rgba(47,44,40,0.06)] rounded-3xl">
                <Activity size={18} className="text-purple-600 mb-4" />
                <p className="text-2xl font-bold text-[var(--ink)]">{anamnesis?.target_weight || "-"} <span className="text-xs font-normal text-[var(--muted)]">kg</span></p>
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Hedef Kilo</p>
             </div>
             <div className="p-6 bg-white border border-[rgba(47,44,40,0.06)] rounded-3xl">
                <TrendingUp size={18} className="text-blue-600 mb-4" />
                <p className="text-2xl font-bold text-[var(--ink)]">%{client.progressPercent}</p>
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Uyum Oranı</p>
             </div>
             <div className="p-6 bg-white border border-[rgba(47,44,40,0.06)] rounded-3xl">
                <Calendar size={18} className="text-amber-600 mb-4" />
                <p className="text-2xl font-bold text-[var(--ink)]">24</p>
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Takip Günü</p>
             </div>
             <div className="p-6 bg-white border border-[rgba(47,44,40,0.06)] rounded-3xl">
                <AlertCircle size={18} className="text-red-600 mb-4" />
                <p className="text-2xl font-bold text-[var(--ink)]">0</p>
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Risk Faktörü</p>
             </div>
          </section>

          {/* Anamnesis Data (Diagram 3.0 -> D2) */}
          <section>
             <div className="flex items-center gap-3 mb-8 border-b border-[rgba(47,44,40,0.06)] pb-4">
                <ClipboardList size={18} className="text-[var(--accent)]" />
                <h3 className="font-bold text-[var(--ink)] uppercase tracking-widest text-xs">Anamnez ve Sağlık Geçmişi (D2)</h3>
             </div>
             
             {isLoadingData ? (
               <div className="h-40 bg-gray-50 rounded-3xl animate-pulse" />
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div>
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Bilinen Hastalıklar</p>
                        <p className="text-sm text-[var(--ink)] font-medium bg-gray-50/50 p-4 rounded-2xl border border-[rgba(47,44,40,0.04)]">
                          {client.chronicConditions && client.chronicConditions.length > 0 
                            ? client.chronicConditions.join(', ') 
                            : (anamnesis?.diseases || "Kayıt yok")}
                        </p>
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Alerjiler</p>
                        <p className="text-sm text-[var(--ink)] font-medium bg-red-50/30 p-4 rounded-2xl border border-red-100/50">
                          {client.allergies && client.allergies.length > 0 
                            ? client.allergies.join(', ') 
                            : (anamnesis?.allergies || "Alerji bildirilmedi")}
                        </p>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-[rgba(47,44,40,0.04)]">
                           <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Uyku</p>
                           <p className="text-sm font-bold text-[var(--ink)]">{anamnesis?.sleep_hours ? `${anamnesis.sleep_hours} Saat` : "Kayıt Yok"}</p>
                        </div>
                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-[rgba(47,44,40,0.04)]">
                           <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Öğün</p>
                           <p className="text-sm font-bold text-[var(--ink)]">{anamnesis?.daily_meals ? `${anamnesis.daily_meals} Sefer` : "Kayıt Yok"}</p>
                        </div>
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Hedef Motivasyonu</p>
                        <p className="text-sm text-[var(--ink)] font-medium italic opacity-80">"{anamnesis?.motivation_reason || client.targetSummary || "Girilmemiş"}"</p>
                     </div>
                  </div>
               </div>
             )}
          </section>

          {/* Progress Measurements (Diagram 4.0 -> D3) */}
          <section>
             <div className="flex items-center justify-between mb-8 border-b border-[rgba(47,44,40,0.06)] pb-4">
                <div className="flex items-center gap-3">
                   <Ruler size={18} className="text-blue-600" />
                   <h3 className="font-bold text-[var(--ink)] uppercase tracking-widest text-xs">Fiziksel Değişim ve Ölçümler (D3)</h3>
                </div>
                <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Grafik Görünümü</button>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] border-b border-[rgba(47,44,40,0.04)]">
                         <th className="pb-4">Tarih</th>
                         <th className="pb-4">Kilo</th>
                         <th className="pb-4">Bel</th>
                         <th className="pb-4">Kalça</th>
                         <th className="pb-4">Boyun</th>
                         <th className="pb-4 text-right">Fark</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[rgba(47,44,40,0.02)]">
                      {measurements.map((m, idx) => (
                         <tr key={m.id} className="text-sm">
                            <td className="py-4 font-bold text-[var(--ink)]">{new Date(m.measured_at).toLocaleDateString('tr-TR')}</td>
                            <td className="py-4">{m.weight_kg} kg</td>
                            <td className="py-4">{m.waist_cm} cm</td>
                            <td className="py-4">{m.hip_cm} cm</td>
                            <td className="py-4">{m.neck_cm} cm</td>
                            <td className="py-4 text-right">
                               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">-1.2</span>
                            </td>
                         </tr>
                      ))}
                      {measurements.length === 0 && (
                         <tr><td colSpan={6} className="py-8 text-center text-xs text-[var(--muted)] italic">Ölçüm kaydı bulunmuyor.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </section>

        </div>

        {/* Right Column: Expert Analysis (1/3) (Diagram 6.0) */}
        <div className="space-y-12">
           
           {/* Dietitian's Case Notes (Diagram D6) */}
           <section className="bg-[var(--ink)] text-white p-8 rounded-[32px] shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                 <FileText size={18} className="text-[var(--accent)]" />
                 <h3 className="font-bold uppercase tracking-widest text-xs">Vaka Analiz Notları (D6)</h3>
              </div>
              <textarea 
                placeholder="Bu danışan hakkında klinik analiz notlarını buraya yazın..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-[var(--accent)] transition-all min-h-[150px] mb-6 placeholder:text-white/20"
              />
              <button className="w-full py-4 bg-[var(--accent)] rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-all">Analizi Kaydet</button>
           </section>

           {/* Quick Reminders */}
           <section className="p-8 border border-[rgba(47,44,40,0.06)] rounded-[32px]">
              <h3 className="font-bold text-[var(--ink)] uppercase tracking-widest text-[10px] mb-6 border-b border-[rgba(47,44,40,0.06)] pb-4">Sistem Hatırlatıcıları</h3>
              <div className="space-y-4">
                 <div className="flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5" />
                    <p className="text-[11px] text-[var(--soft-ink)] font-medium">Danışan son 3 öğününü zamanında tamamladı.</p>
                 </div>
                 <div className="flex items-start gap-3">
                    <AlertCircle size={14} className="text-amber-500 mt-0.5" />
                    <p className="text-[11px] text-[var(--soft-ink)] font-medium">Bu haftalık ölçüm verisi henüz girilmedi.</p>
                 </div>
              </div>
           </section>

        </div>

      </div>
    </div>
  );
}
