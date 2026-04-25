"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck } from "lucide-react";

import { useDemoApp } from "@/components/demo-app-provider";

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Admin girişi yapılamadı.";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useDemoApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const profile = await login(formData.email, formData.password);
      if (profile.role !== "admin") {
        throw new Error("Bu alan sadece admin kullanıcıları içindir.");
      }
      router.replace("/dashboard/admin");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111b14] px-6 py-12 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md border border-white/10 bg-white/5 p-8">
        <div className="mb-8 flex h-12 w-12 items-center justify-center bg-[var(--accent)]">
          <ShieldCheck size={24} />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Admin girişi</h1>
        <p className="mb-8 text-sm leading-7 text-white/60">
          Bu alan kullanıcı, diyetisyen başvurusu ve sistem yönetimi içindir.
        </p>

        {error && (
          <div className="mb-5 border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/45">
              <Mail size={12} /> E-posta
            </span>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              className="w-full border-b border-white/20 bg-transparent py-3 text-sm font-bold outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/45">
              <Lock size={12} /> Şifre
            </span>
            <input
              required
              type="password"
              value={formData.password}
              onChange={(event) =>
                setFormData({ ...formData, password: event.target.value })
              }
              className="w-full border-b border-white/20 bg-transparent py-3 text-sm font-bold outline-none focus:border-[var(--accent)]"
            />
          </label>
        </div>

        <button
          disabled={loading}
          className="mt-8 w-full bg-[var(--accent)] py-4 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60"
        >
          {loading ? "Kontrol ediliyor..." : "Admin paneline gir"}
        </button>
      </form>
    </main>
  );
}
