"use client";

import { useState, useEffect } from "react";
import { useDemoApp } from "@/components/demo-app-provider";
import { supabase } from "@/lib/supabase";
import { 
  UserCircle, 
  Mail, 
  Briefcase, 
  FileText, 
  Save, 
  Camera,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function DietitianProfilePage() {
  const { currentProfile, fetchData } = useDemoApp();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    avatar_url: ""
  });

  useEffect(() => {
    if (currentProfile) {
      const loadProfile = async () => {
        const { data } = await supabase
          .from('users')
          .select('name, title, bio, avatar_url')
          .eq('id', currentProfile.id)
          .single();
        
        if (data) {
          setFormData({
            name: data.name || "",
            title: data.title || "Diyetisyen",
            bio: data.bio || "",
            avatar_url: data.avatar_url || ""
          });
        }
      };
      loadProfile();
    }
  }, [currentProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.rpc("update_own_profile", {
        profile_name: formData.name,
        profile_title: formData.title,
        profile_bio: formData.bio,
        profile_avatar_url: formData.avatar_url,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profiliniz başarıyla güncellendi.' });
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profil güncellenemedi.';
      setMessage({ type: 'error', text: 'Hata: ' + message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <UserCircle size={16} className="text-[var(--accent)]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Hesap Yönetimi · Uzman Profili</p>
        </div>
        <h1 className="text-3xl font-bold text-[var(--ink)] tracking-tight">Profil Bilgilerim</h1>
        <p className="text-[var(--soft-ink)] mt-2">Mobil uygulamada danışanlarınıza görünecek bilgilerinizi buradan düzenleyebilirsiniz.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Header Card */}
        <div className="bg-white border border-[rgba(47,44,40,0.08)] rounded-[40px] p-8 shadow-sm overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[rgba(47,44,40,0.03)] bg-gray-50 flex items-center justify-center shadow-inner">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={64} className="text-[var(--muted)]" />
                )}
              </div>
              <button 
                type="button"
                className="absolute bottom-0 right-0 p-2.5 bg-[var(--accent)] text-white rounded-full shadow-lg hover:scale-110 transition-all"
                title="Fotoğraf Değiştir"
              >
                <Camera size={18} />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-[var(--ink)]">{formData.name || "İsimsiz Uzman"}</h2>
              <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-widest mt-1">{formData.title}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-4 text-[var(--muted)] text-xs font-bold uppercase">
                <Mail size={14} />
                {currentProfile?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white border border-[rgba(47,44,40,0.08)] rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[rgba(223,240,228,0.4)] rounded-xl text-[var(--accent)]">
                  <Briefcase size={18} />
                </div>
                <h3 className="font-bold text-[var(--ink)]">Temel Bilgiler</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2 px-1">İsim Soyisim</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[rgba(47,44,40,0.02)] border border-[rgba(47,44,40,0.06)] rounded-2xl outline-none focus:border-[var(--accent)] focus:bg-white transition-all text-sm font-medium"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2 px-1">Uzmanlık Unvanı</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[rgba(47,44,40,0.02)] border border-[rgba(47,44,40,0.06)] rounded-2xl outline-none focus:border-[var(--accent)] focus:bg-white transition-all text-sm font-medium"
                    placeholder="Örn: Uzman Diyetisyen"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[rgba(47,44,40,0.08)] rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[rgba(223,240,228,0.4)] rounded-xl text-[var(--accent)]">
                  <Camera size={18} />
                </div>
                <h3 className="font-bold text-[var(--ink)]">Profil Fotoğrafı</h3>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2 px-1">Fotoğraf URL (Geçici)</label>
                <input 
                  type="text"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                  className="w-full px-5 py-3.5 bg-[rgba(47,44,40,0.02)] border border-[rgba(47,44,40,0.06)] rounded-2xl outline-none focus:border-[var(--accent)] focus:bg-white transition-all text-sm font-medium"
                  placeholder="https://gorsel-linki.com/foto.jpg"
                />
                <p className="text-[10px] text-[var(--muted)] mt-2 px-1 font-medium italic">
                  * Şimdilik fotoğraf URL'si girebilirsiniz. Dosya yükleme özelliği yakında eklenecek.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[rgba(47,44,40,0.08)] rounded-[32px] p-8 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[rgba(223,240,228,0.4)] rounded-xl text-[var(--accent)]">
                <FileText size={18} />
              </div>
              <h3 className="font-bold text-[var(--ink)]">Hakkımda / Biyografi</h3>
            </div>
            <textarea 
              rows={12}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full px-5 py-4 bg-[rgba(47,44,40,0.02)] border border-[rgba(47,44,40,0.06)] rounded-3xl outline-none focus:border-[var(--accent)] focus:bg-white transition-all text-sm font-medium resize-none leading-relaxed"
              placeholder="Eğitiminiz, uzmanlık alanlarınız ve çalışma prensiplerinizden bahsedin..."
            />
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-3 px-10 py-4 bg-[var(--accent)] text-white font-bold rounded-full shadow-lg shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            <span>Değişiklikleri Kaydet</span>
          </button>
        </div>
      </form>
    </div>
  );
}
