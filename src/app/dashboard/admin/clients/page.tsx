"use client";

import { useState } from "react";
import { 
  Users, 
  Search, 
  ChevronRight, 
  ArrowUpRight, 
  Building2, 
  ClipboardList,
  Filter,
  UserCheck
} from "lucide-react";
import { useDemoApp } from "@/components/demo-app-provider";

export default function AdminClientsPage() {
  const { state } = useDemoApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = state.clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList size={16} className="text-[var(--accent)]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Yönetim Paneli · Danışan Arşivi</p>
          </div>
          <h1 className="text-3xl font-bold text-[var(--ink)] tracking-tight">Tüm Danışan Takibi</h1>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <input 
                type="text" 
                placeholder="Danışan ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-[rgba(47,44,40,0.1)] rounded-full text-sm outline-none focus:border-[var(--accent)] transition-all w-64 shadow-sm"
              />
           </div>
           <button className="p-3 bg-white border border-[rgba(47,44,40,0.1)] rounded-full text-[var(--muted)] hover:text-[var(--ink)] transition-all shadow-sm">
              <Filter size={18} />
           </button>
        </div>
      </header>

      {/* Client List Container */}
      <div className="bg-white border border-[rgba(47,44,40,0.08)] rounded-[40px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[rgba(47,44,40,0.01)] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] border-b border-[rgba(47,44,40,0.06)]">
                <th className="px-8 py-5">Danışan Bilgisi</th>
                <th className="px-8 py-5">Klinik Durumu</th>
                <th className="px-8 py-5">Sorumlu Uzman</th>
                <th className="px-8 py-5">Abonelik</th>
                <th className="px-8 py-5 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(47,44,40,0.04)]">
              {filteredClients.map((client) => (
                <tr key={client.id} className="group hover:bg-[rgba(47,44,40,0.01)] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[var(--ink)] font-bold text-sm border border-[rgba(47,44,40,0.05)] shadow-sm">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--ink)] text-sm">{client.name}</p>
                        <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-tight">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      client.status.includes('bekliyor') ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <UserCheck size={14} className="text-[var(--accent)]" />
                       <span className="text-xs font-bold text-[var(--ink)]">
                         {(() => {
                           const dyt = state.staff.find(s => s.id === client.dietitianId);
                           return dyt ? `Dyt. ${dyt.name}` : "Atanmadı";
                         })()}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-[var(--ink)] uppercase tracking-widest">{client.subscription.plan}</p>
                    <p className="text-[9px] text-[var(--muted)] font-bold uppercase mt-0.5">{client.subscription.renewal} Yenileme</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="inline-flex p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-all">
                      <ArrowUpRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-[var(--muted)] italic text-sm">
                    Arama kriterlerine uygun danışan bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-3 text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
         <Building2 size={14} /> Health Corner Clinic Danışan Arşivi
      </div>
    </div>
  );
}
