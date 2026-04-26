"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, UserPlus, CheckCircle, Users, ArrowUpRight, X } from "lucide-react";

import { useDemoApp } from "@/components/demo-app-provider";

export default function DietitianClientsPage() {
  const { state, isLoading, currentProfile, updateClientFocus, claimClient, updateAppointmentStatus } = useDemoApp();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-pulse">
        <div className="text-[var(--muted)] font-bold uppercase tracking-[0.3em]">Danışanlar Yükleniyor...</div>
      </div>
    );
  }

  // Separate clients into Active (assigned to me) and Pending (no dietitian assigned BUT had appointment with me)
  const myClients = state.clients.filter(c => c.dietitianId === currentProfile?.id);
  const pendingClients = state.clients.filter(c => {
    const isUnassigned = !c.dietitianId || c.dietitianId === "";
    // Görüşmesi tamamlanmış ama henüz bir diyetisyene bağlanmamış olanları göster
    const hasCompletedAppointment = state.appointments.some(a => 
      a.clientId === c.id && a.status === 'completed'
    );
    return isUnassigned && hasCompletedAppointment;
  });

  const currentList = activeTab === "active" ? myClients : pendingClients;

  const filtered = currentList.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.goalLabel.toLowerCase().includes(search.toLowerCase())
  );

  const handleClaimClient = async (clientId: string) => {
    try {
      await claimClient(clientId);
    } catch (err) {
      console.error("Claim failed:", err);
    }
  };

  const handleRejectClient = async (clientId: string) => {
    if (!confirm("Bu danışan adayını reddetmek istediğinize emin misiniz?")) return;
    try {
      // Danışanın bu diyetisyenle olan tamamlanmış randevularını 'archived' yap ki aday listesinden düşsün
      const clientApps = state.appointments.filter(a => a.clientId === clientId && a.status === 'completed');
      for (const app of clientApps) {
        await updateAppointmentStatus(app.id, 'archived');
      }
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)] sm:text-3xl">Danışan Yönetimi</h1>
          <p className="mt-1 text-sm text-[var(--soft-ink)]">
            {myClients.length} aktif danışan, {pendingClients.length} yeni aday
          </p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Danışan ara..."
            className="w-full sm:w-56 rounded-lg border border-[rgba(47,44,40,0.1)] pl-9 pr-4 py-2 text-sm outline-none bg-white focus:border-[var(--accent)] transition"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[rgba(223,240,228,0.3)] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "active" ? "bg-white text-[var(--accent)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--soft-ink)]"
          }`}
        >
          <Users size={16} />
          Danışanlarım ({myClients.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "pending" ? "bg-white text-[var(--accent)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--soft-ink)]"
          }`}
        >
          <UserPlus size={16} />
          Danışan Adayları ({pendingClients.length})
        </button>
      </div>

      {/* Table header */}
      <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_1fr_1.5fr_1fr] rounded-none border-b border-[rgba(47,44,40,0.1)] bg-[rgba(223,240,228,0.2)] px-4 py-3 text-xs uppercase tracking-widest text-[var(--muted)] font-bold">
        <span>Danışan</span>
        <span>Durum</span>
        <span>İlerleme</span>
        <span>Plan / Hedef</span>
        <span>İşlem</span>
      </div>

      {/* Client rows */}
      <div className="divide-y divide-[rgba(47,44,40,0.06)] bg-white rounded-2xl border border-[rgba(47,44,40,0.05)] overflow-hidden">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="px-4 py-4 lg:grid lg:grid-cols-[2fr_1fr_1fr_1.5fr_1fr] lg:items-center lg:gap-4 hover:bg-[rgba(223,240,228,0.1)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] text-sm font-bold shrink-0">
                {client.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--ink)] truncate">{client.name}</p>
                <p className="text-xs text-[var(--muted)]">{client.email}</p>
              </div>
            </div>

            <div className="mt-2 lg:mt-0">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                client.subscription.plan === "premium" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
              }`}>
                {client.subscription.plan}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 lg:mt-0">
              <span className="text-xs text-[var(--accent)] font-bold">%{client.progressPercent}</span>
              <div className="flex-1 h-1.5 rounded-full bg-[rgba(223,240,228,0.6)] max-w-[60px]">
                <div className="h-1.5 rounded-full bg-[var(--accent)]" style={{ width: `${client.progressPercent}%` }} />
              </div>
            </div>

            <div className="mt-2 lg:mt-0">
              <p className="text-sm text-[var(--ink)] font-medium truncate">{client.goalLabel}</p>
              <p className="text-xs text-[var(--muted)]">{client.status}</p>
            </div>

            <div className="mt-4 lg:mt-0">
              {activeTab === "pending" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleClaimClient(client.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)] text-white text-xs font-bold rounded-lg hover:opacity-90 transition shadow-sm"
                  >
                    <CheckCircle size={14} />
                    DANIŞANIM YAP
                  </button>
                  <button
                    onClick={() => handleRejectClient(client.id)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-red-200 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50 transition"
                  >
                    <X size={14} />
                    KABUL ETME
                  </button>
                </div>
              ) : (
                <Link
                  href={`/dashboard/dietitian/plans?clientId=${client.id}`}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"
                >
                  DETAYLARI GÖR
                  <ArrowUpRight size={13} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-[rgba(223,240,228,0.1)] rounded-2xl border-2 border-dashed border-[rgba(47,44,40,0.05)]">
          <p className="text-sm text-[var(--muted)] font-medium">Bu bölümde henüz danışan bulunmuyor.</p>
        </div>
      )}
    </div>
  );
}
