"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BellRing,
  CalendarRange,
  ClipboardList,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquareText,
  UserCircle,
  UsersRound,
  X,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Settings,
  FileText,
  RefreshCw,
} from "lucide-react";

import { useDemoApp } from "@/components/demo-app-provider";

const navConfig = {
  dietitian: [
    { href: "/dashboard/dietitian", label: "Ana Sayfa", icon: LayoutGrid },
    { href: "/dashboard/dietitian/clients", label: "Danışanlarım", icon: UsersRound },
    { href: "/dashboard/dietitian/plans", label: "Diyet Listeleri", icon: ClipboardList },
    { href: "/dashboard/dietitian/templates", label: "Diyet Şablonları", icon: FileText },
    { href: "/dashboard/dietitian/appointments", label: "Randevularım", icon: CalendarRange },
    { href: "/dashboard/dietitian/messages", label: "Mesajlar", icon: MessageSquareText },
    { href: "/dashboard/dietitian/profile", label: "Profilim", icon: UserCircle },
  ],
  client: [
    { href: "/dashboard/client", label: "Genel Bakış", icon: LayoutGrid },
    { href: "/dashboard/client/plan", label: "Diyet Planım", icon: ClipboardList },
    { href: "/dashboard/client/menu", label: "Günlük Menü", icon: TrendingUp },
    { href: "/dashboard/client/messages", label: "İletişim", icon: MessageSquareText },
    { href: "/dashboard/client/subscription", label: "Abonelik", icon: CreditCard },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Klinik Özeti", icon: LayoutGrid },
    { href: "/dashboard/admin/staff", label: "Personel Yönetimi", icon: UsersRound },
    { href: "/dashboard/admin/clients", label: "Danışan Takibi", icon: ClipboardList },
    { href: "/dashboard/admin/settings", label: "Klinik Ayarları", icon: Settings },
  ],
};

function isActivePath(currentPath: string, href: string) {
  if (href === "/dashboard/dietitian" || href === "/dashboard/client" || href === "/dashboard/admin") {
    return currentPath === href;
  }
  return currentPath.startsWith(href);
}

export function DietitianDashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, notifications, currentRole, setRole, logout, user, fetchData } = useDemoApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 600);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = navConfig[currentRole] || navConfig.dietitian;

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef6ef_0%,#e2efe6_100%)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-white border-r border-[var(--border-soft)] shadow-[8px_0_40px_rgba(0,0,0,0.06)] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between px-6 text-[var(--accent)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white">
              <ClipboardList size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--ink)]">
              Health Corner
            </span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} className="text-[var(--soft-ink)]" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--muted)]">
            {currentRole === 'client' ? 'DANIŞAN PANELİ' : currentRole === 'admin' ? 'ADMİN PANELİ' : 'DİYETİSYEN PANELİ'}
          </p>
          <div className="space-y-0.5">
            {navigationItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-[rgba(223,240,228,0.6)] text-[var(--accent)]"
                      : "text-[var(--soft-ink)] hover:bg-[rgba(223,240,228,0.25)] hover:text-[var(--ink)]"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    size={20}
                    className={`transition-colors ${
                      active ? "text-[var(--accent)]" : "text-[var(--muted)] group-hover:text-[var(--soft-ink)]"
                    }`}
                  />
                  <div className="flex-1">
                    <span className="block leading-none">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>



        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 px-3 py-3 rounded-none bg-[rgba(223,240,228,0.3)] border border-[rgba(47,44,40,0.05)]">
            <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {(user?.email || state.dietitian.name).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--ink)] truncate">{user?.email?.split('@')[0] || state.dietitian.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold truncate">
                {currentRole === 'client' ? 'Aktif Danışan' : currentRole === 'admin' ? 'Sistem Yöneticisi' : 'Diyetisyen'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 border border-[rgba(47,44,40,0.1)] py-3 text-sm font-bold text-[var(--soft-ink)] transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
          >
            <LogOut size={18} />
            <span>Oturumu Kapat</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col lg:pl-[280px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-6 bg-white/60 backdrop-blur-md border-b border-[rgba(47,44,40,0.08)] lg:h-20 lg:px-12">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} className="text-[var(--ink)]" />
          </button>

          <div className="hidden lg:block">
             <div className="flex items-center gap-2">
               <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Panel /</span>
               <span className="text-sm font-bold text-[var(--ink)]">
                 {navigationItems.find(i => isActivePath(pathname, i.href))?.label || "Genel"}
               </span>
             </div>
          </div>

          <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-2.5 text-[var(--soft-ink)] hover:bg-[rgba(223,240,228,0.4)] transition-all rounded-full ${isRefreshing ? "animate-spin text-[var(--accent)]" : ""}`}
              title="Sayfayı Yenile"
            >
              <RefreshCw size={20} />
            </button>
            <Link
              href="/dashboard/dietitian/messages"
              className="relative p-2.5 text-[var(--soft-ink)] hover:bg-[rgba(223,240,228,0.4)] transition-colors rounded-full"
            >
              <BellRing size={22} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#b95f33] border-2 border-white" />
              )}
            </Link>
          </div>
          </div>
        </header>

        <main className="flex-1 p-3 pb-28 lg:pb-3 flex flex-col min-h-0">
          <div className="flex-1 bg-white border border-[rgba(47,44,40,0.1)] shadow-[0_10px_40px_rgba(34,73,49,0.06)] p-6 sm:p-10 lg:p-12 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-3 bottom-3 z-20 rounded-[1.8rem] border border-white/75 bg-white/92 p-2 shadow-[0_20px_60px_rgba(34,73,49,0.16)] backdrop-blur lg:hidden">
        <ul className="flex items-center justify-around">
          {navigationItems.slice(0, 5).map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-2 transition ${
                    active ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" : "text-[var(--soft-ink)]"
                  }`}
                >
                  <item.icon size={22} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
