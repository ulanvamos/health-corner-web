"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDemoApp } from "@/components/demo-app-provider";
import { supabase } from "@/lib/supabase";

import { Suspense } from "react";

function RegisterDietitianContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { registerWithInvitation } = useDemoApp();

  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error || !data) {
        setIsValid(false);
      } else {
        setIsValid(true);
      }
      setIsLoading(false);
    }
    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (!token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await registerWithInvitation({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        token,
      });
      router.push("/login?message=Kayıt başarılı. Giriş yapabilirsiniz.");
    } catch (err: any) {
      setError(err.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (!token || !isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Geçersiz Davetiye</h1>
          <p className="text-[var(--muted)] mb-8">Bu davetiye linki geçersiz, kullanılmış veya süresi dolmuş olabilir.</p>
          <Link href="/login" className="inline-block px-8 py-4 bg-[var(--accent)] text-white rounded-2xl font-semibold hover:opacity-90 transition-all">
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Uzman Kaydı</h1>
          <p className="text-[var(--muted)]">Health Corner ekibine hoş geldiniz.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Tam Adınız</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-6 py-4 bg-[rgba(47,44,40,0.02)] border border-transparent rounded-2xl text-sm outline-none focus:border-[var(--accent)] focus:bg-white transition-all"
              placeholder="Ad Soyad"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">E-posta Adresiniz</label>
            <input 
              required
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-6 py-4 bg-[rgba(47,44,40,0.02)] border border-transparent rounded-2xl text-sm outline-none focus:border-[var(--accent)] focus:bg-white transition-all"
              placeholder="ornek@mail.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Şifre</label>
            <input 
              required
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-6 py-4 bg-[rgba(47,44,40,0.02)] border border-transparent rounded-2xl text-sm outline-none focus:border-[var(--accent)] focus:bg-white transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Şifre Tekrar</label>
            <input 
              required
              type="password" 
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-6 py-4 bg-[rgba(47,44,40,0.02)] border border-transparent rounded-2xl text-sm outline-none focus:border-[var(--accent)] focus:bg-white transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 p-4 rounded-xl">{error}</p>}

          <button 
            disabled={isSubmitting}
            type="submit"
            className="w-full py-5 bg-[var(--accent)] text-white rounded-2xl font-bold shadow-[0_10px_30px_rgba(234,0,75,0.2)] hover:shadow-[0_15px_40px_rgba(234,0,75,0.3)] transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Kaydediliyor..." : "Hesabımı Oluştur"}
          </button>

          <p className="text-center text-sm text-[var(--muted)]">
            Zaten hesabınız var mı? <Link href="/login" className="text-[var(--accent)] font-bold">Giriş Yap</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function RegisterDietitianPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
      </div>
    }>
      <RegisterDietitianContent />
    </Suspense>
  );
}
