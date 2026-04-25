"use client";
import { useState } from "react";
import { useDemoApp } from "@/components/demo-app-provider";
import { ShieldCheck, Lock, AlertCircle } from "lucide-react";

export default function DietitianProfilePage() {
  const { state, updatePassword } = useDemoApp();
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    setIsUpdating(true);
    try {
      await updatePassword(newPassword);
      alert("Şifreniz başarıyla güncellendi.");
      setNewPassword("");
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <header className="border-b border-[rgba(47,44,40,0.06)] pb-10">
        <h1 className="text-3xl font-bold text-[var(--ink)] tracking-tight">Profil ve Güvenlik</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Hesap ayarlarınızı ve güvenliğinizi yönetin.</p>
      </header>

      {/* Profile info */}
      <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
        <div className="w-20 h-20 rounded-3xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] text-3xl font-bold shadow-inner">
          {state.dietitian.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h2 className="text-2xl font-bold text-[var(--ink)]">{state.dietitian.name}</h2>
             <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-widest rounded-full">Onaylı Uzman</span>
          </div>
          <p className="text-sm font-medium text-[var(--accent)] mb-3">{state.dietitian.title}</p>
          <p className="text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
            {state.dietitian.focusSummary}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Stats Section */}
        <section className="space-y-6">
          <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck size={14} className="text-[var(--accent)]" />
            Klinik Özeti
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-[rgba(47,44,40,0.02)] rounded-3xl border border-[rgba(47,44,40,0.04)]">
              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2">Aktif Danışan</p>
              <p className="text-2xl font-bold text-[var(--ink)]">{state.clients.length}</p>
            </div>
            <div className="p-6 bg-[rgba(47,44,40,0.02)] rounded-3xl border border-[rgba(47,44,40,0.04)]">
              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2">Premium Oranı</p>
              <p className="text-2xl font-bold text-[var(--ink)]">
                %{state.clients.length > 0 ? Math.round((state.clients.filter(c => c.subscription.plan === 'premium').length / state.clients.length) * 100) : 0}
              </p>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="space-y-6">
          <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-[0.2em] flex items-center gap-2">
            <Lock size={14} className="text-[var(--accent)]" />
            Şifre ve Güvenlik
          </h3>
          
          <form onSubmit={handleUpdatePassword} className="p-8 bg-white rounded-3xl border border-[rgba(47,44,40,0.08)] shadow-sm space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-3">Yeni Şifre</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-5 py-4 bg-[rgba(47,44,40,0.02)] border border-transparent rounded-2xl text-sm outline-none focus:border-[var(--accent)] focus:bg-white transition-all"
              />
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Şifrenizi değiştirdiğinizde, varsa Admin tarafından atanan geçici şifreniz geçersiz kılınacaktır.
              </p>
            </div>

            <button 
              type="submit"
              disabled={isUpdating}
              className="w-full py-4 bg-[var(--ink)] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent)] transition-all disabled:opacity-50"
            >
              {isUpdating ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
