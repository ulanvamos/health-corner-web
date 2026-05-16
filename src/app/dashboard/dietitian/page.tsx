"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarRange,
  MessageSquareText,
  Activity,
  UsersRound,
  ChevronRight,
  ArrowUpRight,
  Bell,
  Search,
  Plus,
  Building2,
  Clock
} from "lucide-react";

import { useDemoApp } from "@/components/demo-app-provider";

export default function DietitianHomePage() {
  const { state, messages, isSeeded } = useDemoApp();
  const [searchQuery, setSearchQuery] = useState("");

  if (!isSeeded || !state.dietitian) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">Veriler Hazırlanıyor...</div>
        </div>
      </div>
    );
  }

  const activeClients = state.clients.filter(
    (c) => c.subscription.status === "active" || c.subscription.status === "trial"
  );
  const pendingAppointments = state.appointments.filter((a) => a.status === "pending");
  const unreadMessages = messages.filter((m) => m.status !== "read" && m.sender === "client");

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Clinic & Specialist Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <Building2 size={14} className="text-[var(--accent)]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Health Corner Clinic · Baş Diyetisyen</p>
           </div>
          <h1 className="text-3xl font-bold text-[var(--ink)] tracking-tight">
            Günaydın, <span className="text-[var(--accent)]">{state.dietitian.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-[var(--soft-ink)] mt-1 font-medium italic opacity-80">"Kliniğe yeni katılan danışanlar için plan güncellemelerini buradan yönetebilirsin."</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <input 
                type="text" 
                placeholder="Dosya no veya isim..." 
                className="pl-10 pr-4 py-2.5 bg-transparent border-b border-[rgba(47,44,40,0.1)] text-sm outline-none focus:border-[var(--accent)] transition-all w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <button className="bg-[var(--accent)] text-white p-3 rounded-full shadow-lg shadow-[var(--accent)]/20 hover:scale-105 transition-all">
              <Plus size={20} />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Main Operational Area (2/3) */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* Clinic Stats Row - Minimalist & Institutional */}
          <section className="flex flex-wrap items-center gap-x-12 gap-y-6 pb-10 border-b border-[rgba(47,44,40,0.06)]">
             <Link href="/dashboard/dietitian/clients" className="group flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--accent-soft)] rounded-full flex items-center justify-center text-[var(--accent)]">
                   <UsersRound size={20} />
                </div>
                <div>
                   <p className="text-xl font-bold text-[var(--ink)] leading-none mb-1">{activeClients.length}</p>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Kayıtlı Danışan</p>
                </div>
             </Link>

             <Link href="/dashboard/dietitian/appointments" className="group flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                   <CalendarRange size={20} />
                </div>
                <div>
                   <p className="text-xl font-bold text-[var(--ink)] leading-none mb-1">{pendingAppointments.length}</p>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Randevu Talebi</p>
                </div>
             </Link>

             <Link href="/dashboard/dietitian/messages" className="group flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                   <MessageSquareText size={20} />
                </div>
                <div>
                   <p className="text-xl font-bold text-[var(--ink)] leading-none mb-1">{unreadMessages.length}</p>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Aktif Sohbet</p>
                </div>
             </Link>

             <div className="group flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                   <Activity size={20} />
                </div>
                <div>
                   <p className="text-xl font-bold text-[var(--ink)] leading-none mb-1">%{Math.round((activeClients.filter(c => c.progressPercent > 50).length / (activeClients.length || 1)) * 100)}</p>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Başarı Oranı</p>
                </div>
             </div>
          </section>

          {/* Active Client List - Flat Table UI */}
          <section>
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-xl font-bold text-[var(--ink)]">Dosya Takibi</h2>
                   <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Son güncellenen veya yeni katılanlar</p>
                </div>
                <Link href="/dashboard/dietitian/clients" className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest hover:underline flex items-center gap-1">
                   Tüm Dosyalar <ChevronRight size={14} />
                </Link>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] border-b border-[rgba(47,44,40,0.06)]">
                         <th className="pb-4">Danışan Profili</th>
                         <th className="pb-4">Klinik Durumu</th>
                         <th className="pb-4">Uyum / İlerleme</th>
                         <th className="pb-4 text-right">Detay</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[rgba(47,44,40,0.04)]">
                      {state.clients
                         .filter((client) => {
                            if (!searchQuery.trim()) return true;
                            const query = searchQuery.toLowerCase();
                            return (
                               client.name.toLowerCase().includes(query) ||
                               client.email.toLowerCase().includes(query)
                            );
                         })
                         .map((client) => (
                         <tr key={client.id} className="group hover:bg-[rgba(47,44,40,0.01)] transition-colors">
                            <td className="py-6 pr-4">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[var(--ink)] font-bold text-sm border border-[rgba(47,44,40,0.05)]">
                                     {client.name.charAt(0)}
                                  </div>
                                  <div>
                                     <p className="font-bold text-[var(--ink)] text-sm">{client.name}</p>
                                     <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-tight">{client.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="py-6 px-4">
                               <p className="text-xs font-bold text-[var(--ink)] mb-0.5">{client.status}</p>
                               <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">{client.goalLabel}</p>
                            </td>
                            <td className="py-6 px-4">
                               <div className="flex items-center gap-3">
                                  <div className="flex-1 h-1 rounded-full bg-gray-100 min-w-[80px] overflow-hidden">
                                     <div 
                                        className="h-full bg-[var(--accent)] rounded-full transition-all duration-1000" 
                                        style={{ width: `${client.progressPercent}%` }} 
                                     />
                                  </div>
                                  <span className="text-[10px] font-bold text-[var(--accent)] tracking-tighter">%{client.progressPercent}</span>
                               </div>
                            </td>
                            <td className="py-6 pl-4 text-right">
                               <Link href={`/dashboard/dietitian/clients/${client.id}`} className="inline-flex p-2 text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] rounded-full transition-all">
                                  <ArrowUpRight size={18} />
                               </Link>
                            </td>
                         </tr>
                      ))}
                      {state.clients.filter((client) => {
                         if (!searchQuery.trim()) return true;
                         const query = searchQuery.toLowerCase();
                         return client.name.toLowerCase().includes(query) || client.email.toLowerCase().includes(query);
                      }).length === 0 && (
                         <tr><td colSpan={4} className="py-12 text-center text-[var(--muted)] italic text-sm">Arama kriterlerine uygun danışan bulunamadı.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </section>

        </div>

        {/* Sidebar Operational Center - Flat List UI */}
        <div className="space-y-16">
           
           {/* Daily Schedule - Simplified */}
           <section>
              <div className="flex items-center justify-between mb-8 border-b border-[rgba(47,44,40,0.06)] pb-4">
                 <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    <h3 className="font-bold text-[var(--ink)] uppercase tracking-widest text-xs">Bugünün Programı</h3>
                 </div>
                 <Link href="/dashboard/dietitian/appointments" className="text-[10px] font-bold text-amber-600 uppercase">Tümü</Link>
              </div>
              <div className="space-y-8">
                 {[...state.appointments]
                    .filter((a) => {
                       if (!a.preferred_at) return true;
                       const appDate = new Date(a.preferred_at);
                       const today = new Date();
                       today.setHours(0, 0, 0, 0);
                       return appDate >= today;
                    })
                    .sort((a, b) => {
                       // Önce tarihe göre, sonra saate göre sırala
                       const dateA = a.preferred_at ? new Date(a.preferred_at).getTime() : 0;
                       const dateB = b.preferred_at ? new Date(b.preferred_at).getTime() : 0;
                       if (dateA !== dateB) return dateA - dateB;
                       return (a.time_label || '00:00').localeCompare(b.time_label || '00:00');
                    })
                    .map((item) => (
                    <div key={item.id} className="flex items-center gap-4 group">
                       <div className="w-10 h-10 border border-[rgba(47,44,40,0.06)] rounded-full flex items-center justify-center text-[var(--ink)] shrink-0 group-hover:bg-[var(--ink)] group-hover:text-white transition-all">
                          <p className="font-bold text-[10px] tracking-tighter">{item.time_label || '00:00'}</p>
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-[var(--ink)] text-sm truncate">{item.clientName}</p>
                          <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest truncate">
                             {item.preferred_at ? new Date(item.preferred_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + " • " : ""}
                             {(item.type_label || 'Görüşme').split(' ')[0]} • {item.mode === 'online' ? 'Görüntülü' : 'Klinik'}
                          </p>
                       </div>
                    </div>
                 ))}
                 {state.appointments.filter((a) => !a.preferred_at || new Date(a.preferred_at) >= new Date(new Date().setHours(0,0,0,0))).length === 0 && (
                    <p className="text-xs text-[var(--muted)] italic py-4">Yaklaşan veya onaylanmış randevu bulunmuyor.</p>
                 )}
              </div>
           </section>

           {/* Direct Message Feed */}
           <section>
              <div className="flex items-center gap-2 mb-8 border-b border-[rgba(47,44,40,0.06)] pb-4">
                 <MessageSquareText size={16} className="text-blue-600" />
                 <h3 className="font-bold text-[var(--ink)] uppercase tracking-widest text-xs">Son Yazışmalar</h3>
              </div>
              <div className="space-y-6">
                 {unreadMessages.slice(0, 3).map((msg) => (
                    <div key={msg.id} className="relative pl-4 border-l border-blue-100 py-1">
                       <p className="text-xs font-bold text-[var(--ink)] mb-1 leading-snug">{msg.body.substring(0, 70)}...</p>
                       <p className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-blue-500" /> Yeni Mesaj
                       </p>
                    </div>
                 ))}
                 {unreadMessages.length === 0 && (
                    <p className="text-xs text-[var(--muted)] italic py-4">Yanıt bekleyen yeni mesaj yok.</p>
                 )}
              </div>
              <Link href="/dashboard/dietitian/messages" className="mt-8 block text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">
                 Mesaj Merkezine Git →
              </Link>
           </section>

        </div>

      </div>
    </div>
  );
}
