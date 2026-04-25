"use client";

import { 
  Settings, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  ShieldCheck,
  Save,
  Bell
} from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <Settings size={16} className="text-[var(--accent)]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Yönetim Paneli · Ayarlar</p>
        </div>
        <h1 className="text-3xl font-bold text-[var(--ink)] tracking-tight">Klinik Yapılandırması</h1>
      </header>

      <div className="space-y-16">
        {/* General Info Section */}
        <section className="grid lg:grid-cols-3 gap-12 border-b border-[rgba(47,44,40,0.06)] pb-16">
          <div>
            <h2 className="text-lg font-bold text-[var(--ink)] mb-2">Genel Bilgiler</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">Kliniğinizin danışanlara ve faturaya yansıyacak temel kimlik bilgilerini buradan güncelleyin.</p>
          </div>
          <div className="lg:col-span-2 space-y-8 max-w-2xl">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2"><Building2 size={12}/> Klinik Adı</label>
                <input type="text" defaultValue="Health Corner Clinic" className="w-full bg-transparent border-b border-[rgba(47,44,40,0.1)] py-2 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2"><Globe size={12}/> Web Sitesi</label>
                <input type="text" defaultValue="www.healthcorner.clinic" className="w-full bg-transparent border-b border-[rgba(47,44,40,0.1)] py-2 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2"><MapPin size={12}/> Adres</label>
              <textarea defaultValue="Nişantaşı, Teşvikiye Cd. No:12, 34365 Şişli/İstanbul" className="w-full bg-transparent border-b border-[rgba(47,44,40,0.1)] py-2 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all resize-none h-12" />
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="grid lg:grid-cols-3 gap-12 border-b border-[rgba(47,44,40,0.06)] pb-16">
          <div>
            <h2 className="text-lg font-bold text-[var(--ink)] mb-2">İletişim & Destek</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">Danışanların size ulaşabileceği ve bildirimlerin gideceği kanallar.</p>
          </div>
          <div className="lg:col-span-2 space-y-8 max-w-2xl">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2"><Mail size={12}/> Kurumsal E-posta</label>
                <input type="email" defaultValue="hello@healthcorner.clinic" className="w-full bg-transparent border-b border-[rgba(47,44,40,0.1)] py-2 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2"><Phone size={12}/> Telefon Numarası</label>
                <input type="text" defaultValue="+90 212 555 0123" className="w-full bg-transparent border-b border-[rgba(47,44,40,0.1)] py-2 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all" />
              </div>
            </div>
          </div>
        </section>

        {/* Permissions Section */}
        <section className="grid lg:grid-cols-3 gap-12">
          <div>
            <h2 className="text-lg font-bold text-[var(--ink)] mb-2">Güvenlik & İzinler</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">Klinik içi yetkilendirme ve sistem davranışları.</p>
          </div>
          <div className="lg:col-span-2 space-y-6 max-w-2xl">
             <div className="flex items-center justify-between py-4 border-b border-[rgba(47,44,40,0.04)]">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600"><ShieldCheck size={16}/></div>
                   <span className="text-sm font-bold text-[var(--ink)]">İki Faktörlü Doğrulama (Personel)</span>
                </div>
                <div className="w-10 h-5 bg-[var(--accent)] rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" /></div>
             </div>
             <div className="flex items-center justify-between py-4 border-b border-[rgba(47,44,40,0.04)]">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><Bell size={16}/></div>
                   <span className="text-sm font-bold text-[var(--ink)]">Sistem Bildirimleri</span>
                </div>
                <div className="w-10 h-5 bg-[var(--accent)] rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" /></div>
             </div>
          </div>
        </section>

        <div className="flex justify-end pt-12">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--accent)] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-[var(--accent)]/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {saving ? "Güncelleniyor..." : <><Save size={18} /> Değişiklikleri Kaydet</>}
          </button>
        </div>
      </div>
    </div>
  );
}
