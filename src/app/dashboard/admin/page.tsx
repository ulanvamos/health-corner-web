"use client";

import { useMemo } from "react";
import Link from "next/link";
import { 
  UsersRound, 
  TrendingUp, 
  MessageSquareText, 
  Settings, 
  ChevronRight, 
  ArrowUpRight, 
  Building2, 
  ClipboardList,
  Activity,
  ShieldAlert,
  CreditCard,
  UserPlus
} from "lucide-react";

import { useDemoApp } from "@/components/demo-app-provider";

export default function AdminDashboardPage() {
  // 1. All hooks at the very top
  const { state, allMessages, isLoading } = useDemoApp();

  // 2. Compute everything using useMemo at the top
  const activeSubscriptions = useMemo(() => 
    state.clients.filter((client) => client.subscription.status === "active"),
  [state.clients]);

  const recentClients = useMemo(() => 
    [...state.clients].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5),
  [state.clients]);

  const stats = useMemo(() => ({
    staffCount: state.staff?.length || 0,
    appointmentCount: state.appointments?.length || 0,
    // Add more if needed
  }), [state.staff, state.appointments]);

  // 3. Early return MUST be after ALL hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">Klinik Verileri Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Institutional Header */}
      <header className="mb-16 border-b border-[rgba(47,44,40,0.06)] pb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={16} className="text-[var(--accent)]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Health Corner Clinic · Yönetim Paneli</p>
            </div>
            <h1 className="text-4xl font-bold text-[var(--ink)] tracking-tight">Klinik Genel Bakış</h1>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/dashboard/admin/settings" className="p-3 border border-[rgba(47,44,40,0.1)] rounded-full text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-all">
                <Settings size={20} />
             </Link>
             <button className="bg-[var(--ink)] text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent)] transition-all shadow-lg shadow-black/10">
                Rapor İndir
             </button>
          </div>
        </div>
      </header>

      {/* Stats Grid - Flat Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12 mb-24">
         <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Aktif Danışan</p>
            <div className="flex items-end gap-3">
               <h2 className="text-4xl font-bold text-[var(--ink)]">{activeSubscriptions.length}</h2>
               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">+4%</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
               <div className="w-[75%] h-full bg-[var(--accent)]" />
            </div>
         </div>

         <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Personel Sayısı</p>
            <div className="flex items-end gap-3">
               <h2 className="text-4xl font-bold text-[var(--ink)]">{stats.staffCount}</h2>
               <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1">Stabil</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
               <div className="w-[45%] h-full bg-blue-500" />
            </div>
         </div>

         <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Aylık Randevu</p>
            <div className="flex items-end gap-3">
               <h2 className="text-4xl font-bold text-[var(--ink)]">{stats.appointmentCount}</h2>
               <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mb-1">+12%</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
               <div className="w-[85%] h-full bg-amber-500" />
            </div>
         </div>

         <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Klinik Doluluk</p>
            <div className="flex items-end gap-3">
               <h2 className="text-4xl font-bold text-[var(--ink)]">82%</h2>
               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">Mükemmel</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
               <div className="w-[82%] h-full bg-emerald-500" />
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-24">
         {/* Recent Clients List - No Cards */}
         <section>
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-[var(--ink)] tracking-tight">Son Kayıt Olanlar</h3>
               <Link href="/dashboard/admin/clients" className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] hover:underline flex items-center gap-1">
                  Tümünü Gör <ChevronRight size={12} />
               </Link>
            </div>
            <div className="space-y-6">
               {recentClients.map(client => (
                  <div key={client.id} className="flex items-center justify-between py-4 border-b border-[rgba(47,44,40,0.04)] group hover:border-[var(--accent)] transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs">
                           {client.name.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-sm text-[var(--ink)]">{client.name}</p>
                           <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-tight">{client.email}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Plan</p>
                           <p className="text-xs font-bold text-[var(--ink)]">{client.subscription.plan}</p>
                        </div>
                        <button className="p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-all">
                           <ArrowUpRight size={18} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Quick Actions & System Health */}
         <section className="space-y-16">
            <div>
               <h3 className="text-lg font-bold text-[var(--ink)] tracking-tight mb-8">Hızlı İşlemler</h3>
               <div className="grid grid-cols-2 gap-4">
                  <Link href="/dashboard/admin/staff" className="flex items-center gap-4 p-5 bg-gray-50 border border-transparent hover:border-[var(--accent)] hover:bg-white transition-all rounded-2xl group">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[var(--accent)] shadow-sm group-hover:scale-110 transition-transform">
                        <UserPlus size={20} />
                     </div>
                     <span className="text-xs font-bold text-[var(--ink)] uppercase tracking-widest">Yeni Personel</span>
                  </Link>
                  <Link href="/dashboard/admin/settings" className="flex items-center gap-4 p-5 bg-gray-50 border border-transparent hover:border-[var(--accent)] hover:bg-white transition-all rounded-2xl group">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                        <CreditCard size={20} />
                     </div>
                     <span className="text-xs font-bold text-[var(--ink)] uppercase tracking-widest">Ödeme Ayarları</span>
                  </Link>
               </div>
            </div>

            <div>
               <h3 className="text-lg font-bold text-[var(--ink)] tracking-tight mb-8">Sistem Durumu</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                     <div className="flex items-center gap-3 text-emerald-700">
                        <Activity size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Veritabanı</span>
                     </div>
                     <span className="text-[10px] font-bold text-emerald-600 uppercase">Aktif & Stabil</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                     <div className="flex items-center gap-3 text-emerald-700">
                        <ShieldAlert size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Güvenlik Duvarı</span>
                     </div>
                     <span className="text-[10px] font-bold text-emerald-600 uppercase">Korunuyor</span>
                  </div>
               </div>
            </div>
         </section>
      </div>
    </div>
  );
}
