"use client";

import Link from "next/link";
import { Clock, FileText, ShieldCheck } from "lucide-react";

import { useDemoApp } from "@/components/demo-app-provider";

export default function DietitianPendingPage() {
  const { currentProfile, dietitianApplication, logout } = useDemoApp();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center">
      <div className="border border-amber-100 bg-amber-50/70 p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center bg-white text-amber-700 shadow-sm">
          <Clock size={28} />
        </div>

        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-700">
          Başvuru incelemede
        </p>
        <h1 className="mb-4 text-3xl font-bold text-[var(--ink)]">
          Diyetisyen hesabınız admin onayı bekliyor.
        </h1>
        <p className="mb-8 text-sm leading-7 text-[var(--soft-ink)]">
          {currentProfile?.fullName ?? "Başvurunuz"} için oluşturulan uzman
          hesabı belge kontrolü tamamlanana kadar tam panele erişemez.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-white/80 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
              <FileText size={13} /> Belge
            </div>
            <p className="text-sm font-bold text-[var(--ink)]">
              {dietitianApplication?.documentName || "Belge bekleniyor"}
            </p>
          </div>

          <div className="border border-white/80 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
              <ShieldCheck size={13} /> Durum
            </div>
            <p className="text-sm font-bold text-[var(--ink)]">Onay bekliyor</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="bg-[var(--accent)] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white"
          >
            Giriş ekranına dön
          </Link>
          <button
            onClick={() => void logout()}
            className="border border-[rgba(47,44,40,0.12)] px-5 py-3 text-xs font-bold uppercase tracking-widest text-[var(--soft-ink)]"
          >
            Oturumu kapat
          </button>
        </div>
      </div>
    </main>
  );
}
