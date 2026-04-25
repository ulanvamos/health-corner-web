"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { useDemoApp } from "@/components/demo-app-provider";
import type { UserRole } from "@/components/demo-app-provider";

const dashboardByRole: Partial<Record<UserRole, string>> = {
  admin: "/dashboard/admin",
  dietitian: "/dashboard/dietitian",
};

function dashboardForProfile(profile: { role: UserRole; status: string }) {
  if (profile.role === "dietitian" && profile.status === "pending") {
    return "/dashboard/dietitian/pending";
  }
  return dashboardByRole[profile.role];
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useDemoApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const profile = await login(formData.email, formData.password);
      if (profile.role === "client") {
        setError("Lütfen mobil uygulamayı kullanın. Web arayüzü sadece uzmanlar içindir.");
        setLoading(false);
        return;
      }
      router.replace(dashboardForProfile(profile) as string);
    } catch (err: any) {
      setError(err.message || "Giriş yapılamadı. Bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  }  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Side: Visual & Branding */}
      <div className="lg:w-1/2 bg-[var(--ink)] relative overflow-hidden hidden lg:flex flex-col justify-between p-16 text-white">
        {/* Abstract background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)] rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight uppercase">Health Corner</span>
          </div>

          <h1 className="text-6xl font-serif leading-[1.1] mb-8">
            Diyet süreciniz<br /> 
            <span className="text-[var(--accent)] italic">artık daha düzenli.</span>
          </h1>
          <p className="text-xl text-white/60 max-w-md leading-relaxed">
            Ölçüm, plan, menü ve mesajlaşma akışlarını tek bir profesyonel panelden yönetin.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          {[
            "Danışan için mobil öncelikli takip",
            "Diyetisyen için gelişmiş panel",
            "Rol bazlı otomatik yönlendirme"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 group cursor-default">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[var(--accent)] transition-colors">
                <CheckCircle2 size={20} className="text-[var(--accent)]" />
              </div>
              <p className="font-bold text-white/80">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-[#f9fafb]">
        <div className="max-w-[440px] mx-auto w-full">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[var(--ink)] mb-2">Giriş Yap</h2>
            <p className="text-[var(--soft-ink)] text-sm font-medium">E-posta ve şifrenizle devam edin.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
                  <Mail size={12} /> E-posta
                </label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="ornek@mail.com"
                  className="w-full border-b-2 border-[rgba(47,44,40,0.1)] py-2.5 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all bg-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
                  <Lock size={12} /> Şifre
                </label>
                <input 
                  required
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full border-b-2 border-[rgba(47,44,40,0.1)] py-2.5 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all bg-transparent"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-[var(--accent)] text-white py-4 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#24794e] shadow-xl shadow-[var(--accent)]/10 transition-all active:scale-[0.98]"
            >
              {loading ? "Giriş yapılıyor..." : <><LogIn size={16} /> Oturum Aç</>}
            </button>
          </form>

          <div className="mt-12 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
            <ShieldCheck size={12} /> Supabase Secure Auth
          </div>
        </div>
      </div>
    </div>
  );
}
