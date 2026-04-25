"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  NotebookPen,
  MessageSquareText,
  BarChart3,
  CreditCard,
  Bell,
  ArrowLeft,
  RefreshCw
} from "lucide-react";

import { useDemoApp } from "@/components/demo-app-provider";

const navigationItems = [
  {
    href: "/dashboard/client",
    label: "Özet",
    mobileLabel: "Özet",
    icon: LayoutGrid,
  },
  {
    href: "/dashboard/client/plan",
    label: "Plan",
    mobileLabel: "Plan",
    icon: NotebookPen,
  },
  {
    href: "/dashboard/client/messages",
    label: "Mesajlar",
    mobileLabel: "Mesaj",
    icon: MessageSquareText,
  },
  {
    href: "/dashboard/client/stats",
    label: "İstatistik",
    mobileLabel: "Analiz",
    icon: BarChart3,
  },
  {
    href: "/dashboard/client/subscription",
    label: "Abonelik",
    mobileLabel: "Paket",
    icon: CreditCard,
  }
] as const;

function isActivePath(currentPath: string, href: string) {
  if (href === "/dashboard/client") {
    return currentPath === href;
  }
  return currentPath.startsWith(href);
}

export function ClientDashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { featuredClient, notifications, fetchData } = useDemoApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <main className="min-h-screen bg-[#f8faf9] pb-32 lg:pb-0 lg:pl-72 transition-all duration-500">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-[rgba(47,44,40,0.06)] hidden lg:flex flex-col p-8 z-30">
        <div className="flex items-center gap-2 mb-12">
           <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--accent)]/20">H</div>
           <span className="font-bold text-[var(--ink)] tracking-tight uppercase text-sm">Health Corner</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navigationItems.map(({ href, label, icon: Icon }) => {
            const isActive = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all rounded-xl ${
                  isActive 
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                    : "text-[var(--muted)] hover:bg-gray-50 hover:text-[var(--ink)]"
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-8 space-y-2 border-t border-[rgba(47,44,40,0.06)]">
           <button
             onClick={handleRefresh}
             className="flex w-full items-center gap-3 text-sm font-bold text-[var(--muted)] hover:bg-gray-50 p-4 rounded-xl transition-colors"
           >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin text-[var(--accent)]" : ""} />
              Yenile
           </button>
           <Link href="/login" className="flex items-center gap-3 text-sm font-bold text-red-500 hover:bg-red-50 p-4 rounded-xl transition-colors">
              <ArrowLeft size={18} /> Çıkış Yap
           </Link>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-40 border-b border-[rgba(47,44,40,0.04)] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] flex items-center justify-center font-bold text-[var(--accent)]">
            {featuredClient.name.charAt(0)}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] leading-none mb-1">Hoş Geldin</p>
            <p className="font-bold text-[var(--ink)] leading-none">{featuredClient.name.split(' ')[0]}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[var(--ink)]"
          >
            <RefreshCw size={20} className={isRefreshing ? "animate-spin text-[var(--accent)]" : ""} />
          </button>
          <button className="relative w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[var(--ink)]">
             <Bell size={20} />
             {notifications.length > 0 && (
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
             )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 lg:p-12 max-w-5xl mx-auto min-h-[calc(100vh-80px)]">
        {children}
      </div>

      {/* Mobile Bottom Navigation (Refined Glassmorphism) */}
      <nav className="fixed bottom-6 left-6 right-6 lg:hidden z-50">
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between border border-white/50">
          {navigationItems.map(({ href, mobileLabel, icon: Icon }) => {
            const isActive = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center justify-center gap-1 py-3 flex-1 transition-all duration-300 ${
                  isActive ? "text-[var(--accent)] scale-110" : "text-gray-400"
                }`}
              >
                <div className={`p-2 rounded-2xl transition-all ${isActive ? "bg-[var(--accent-soft)]" : ""}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[8px] font-extrabold uppercase tracking-widest transition-all ${isActive ? "opacity-100 mt-0.5" : "opacity-0 h-0 overflow-hidden"}`}>
                  {mobileLabel}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
