"use client";

import { useState, useMemo } from "react";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Search,
  Building2,
  ArrowUpRight,
  X,
  Loader2,
  Copy
} from "lucide-react";
import { useDemoApp } from "@/components/demo-app-provider";

export default function StaffManagementPage() {
  // 1. All Hooks must be at the very top
  const { state, isLoading, createDietitian, setTemporaryPassword } = useDemoApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const { createInvitation } = useDemoApp();

  // 2. Computed values using useMemo to be safe
  const filtered = useMemo(() => {
    const staff = state.staff || [];
    return staff.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.staff, searchTerm]);

  // 3. Handlers
  const handleGenerateInvite = async () => {
    setIsSubmitting(true);
    try {
      const token = await createInvitation();
      const link = `${window.location.origin}/register/dietitian?token=${token}`;
      setInviteLink(link);
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert("Link kopyalandı!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createDietitian(formData);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
      alert("Diyetisyen başarıyla eklendi ve giriş yetkisi tanımlandı!");
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Early return MUST be after all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-pulse">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">Personel Verileri Yükleniyor...</div>
      </div>
    );
  }

  const staffCount = state.staff?.length || 0;
  const activeCount = state.staff?.filter(s => s.is_active).length || 0;

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={16} className="text-[var(--accent)]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Yönetim Paneli · Personel Merkezi</p>
        </div>
        <h1 className="text-3xl font-bold text-[var(--ink)] tracking-tight">Kadro Yönetimi</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Invitation Section */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[rgba(47,44,40,0.03)] flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-3">Yeni Uzman Davet Et</h2>
            <p className="text-sm text-[var(--muted)] mb-8 leading-relaxed">
              Diyetisyenlerin güvenli bir şekilde kayıt olabilmesi için 24 saat geçerli, tek kullanımlık bir kayıt linki oluşturun.
            </p>
          </div>
          
          {!inviteLink ? (
            <button 
              onClick={handleGenerateInvite}
              disabled={isSubmitting}
              className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-bold shadow-[0_10px_30px_rgba(234,0,75,0.15)] hover:shadow-[0_15px_40px_rgba(234,0,75,0.25)] transition-all flex items-center justify-center gap-3"
            >
              <UserPlus size={18} /> {isSubmitting ? "Oluşturuluyor..." : "Kayıt Linki Oluştur"}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-[rgba(47,44,40,0.03)] rounded-2xl border border-dashed border-[rgba(47,44,40,0.1)]">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Davet Linki</p>
                <p className="text-xs font-mono break-all text-[var(--accent)]">{inviteLink}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={copyToClipboard}
                  className="flex-1 py-4 bg-white border border-[rgba(47,44,40,0.1)] rounded-2xl text-sm font-bold hover:bg-[rgba(47,44,40,0.02)] transition-all flex items-center justify-center gap-2"
                >
                  <Copy size={16} /> Kopyala
                </button>
                <button 
                  onClick={() => setInviteLink(null)}
                  className="px-6 py-4 bg-white border border-[rgba(47,44,40,0.1)] rounded-2xl text-sm font-bold hover:bg-[rgba(47,44,40,0.02)] transition-all"
                >
                  Yeni
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="bg-[#1C1C1C] rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Aktif Kadro</h2>
            <p className="text-white/60 text-sm mb-8">Sistemdeki toplam aktif uzman sayısı.</p>
            <div className="text-6xl font-bold">{activeCount}</div>
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sistem Çevrimiçi</span>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[var(--accent)] blur-[100px] opacity-20" />
        </div>
      </div>

      {/* Staff List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-[rgba(47,44,40,0.06)] pb-6">
           <h2 className="text-lg font-bold text-[var(--ink)] tracking-tight">Klinik Uzman Listesi</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <input 
                type="text" 
                placeholder="Personel ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-transparent border border-[rgba(47,44,40,0.1)] rounded-full text-sm outline-none focus:border-[var(--accent)] transition-all w-64"
              />
           </div>
        </div>

        <div className="divide-y divide-[rgba(47,44,40,0.04)]">
          {filtered.map((member) => (
            <article key={member.id} className="py-8 group flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-[rgba(47,44,40,0.01)] transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] flex items-center justify-center font-bold text-sm text-[var(--accent)]">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--ink)] text-base mb-0.5">{member.name}</h3>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">{member.role}</span>
                     <span className="w-1 h-1 bg-[var(--muted)] rounded-full opacity-30" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{member.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                 <div className="text-right hidden lg:block">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Danışan Yükü</p>
                    <p className="text-sm font-bold text-[var(--ink)]">{state.clients.filter(c => c.dietitianId === member.id).length} Danışan</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${member.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {member.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                    <button 
                      onClick={() => {
                        const pass = prompt(`${member.name} için geçici şifre girin:`);
                        if (pass) {
                          setTemporaryPassword(member.id, pass)
                            .then(() => alert("Geçici şifre tanımlandı."))
                            .catch(err => alert("Hata: " + err.message));
                        }
                      }}
                      className="px-4 py-2 border border-[rgba(47,44,40,0.1)] rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--ink)] hover:text-white transition-all mr-2"
                    >
                      Şifre Belirle
                    </button>
                    <button className="p-2 text-[var(--muted)] hover:text-[var(--ink)] transition-all">
                      <ArrowUpRight size={20} />
                    </button>
                 </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Add Dietitian Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--ink)]">Yeni Diyetisyen Ekle</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-6 mb-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Tam Adı</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-4 bg-[rgba(47,44,40,0.02)] border border-transparent rounded-2xl text-sm outline-none focus:border-[var(--accent)] focus:bg-white transition-all"
                      placeholder="Dyt. Ad Soyad"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">E-posta Adresi</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-5 py-4 bg-[rgba(47,44,40,0.02)] border border-transparent rounded-2xl text-sm outline-none focus:border-[var(--accent)] focus:bg-white transition-all"
                      placeholder="uzman@healthcorner.com"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Başlangıç Şifresi</label>
                    <input 
                      required
                      type="text" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-5 py-4 bg-[rgba(47,44,40,0.02)] border border-transparent rounded-2xl text-sm outline-none focus:border-[var(--accent)] focus:bg-white transition-all"
                      placeholder="temp123"
                    />
                    <p className="text-[9px] text-[var(--muted)]">Bu şifre uzman tarafından profilinden değiştirilebilir.</p>
                 </div>
              </div>
              <button 
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-[var(--ink)] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent)] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                Diyetisyeni Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-24 pt-10 border-t border-[rgba(47,44,40,0.04)] flex items-center justify-center gap-3 text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
         <Building2 size={14} /> Health Corner Clinic Personel Arşivi
      </div>
    </div>
  );
}
