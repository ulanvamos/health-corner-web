"use client";

import { useDemoApp } from "@/components/demo-app-provider";
import { Lock, Crown, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function SubscriptionGate({ 
  children, 
  feature = "bu özelliği" 
}: { 
  children: React.ReactNode, 
  feature?: string 
}) {
  const { featuredClient } = useDemoApp();
  
  const isPremium = featuredClient.subscription.plan === 'premium' && featuredClient.subscription.status === 'active';

  if (isPremium) return <>{children}</>;

  return (
    <div className="relative min-h-[400px] flex items-center justify-center overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 p-8 text-center">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-0" />
      
      <div className="relative z-10 max-w-md animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6 shadow-sm border border-amber-100">
          <Lock size={24} />
        </div>
        
        <h2 className="text-2xl font-bold text-[var(--ink)] mb-3">Premium İçerik</h2>
        <p className="text-[var(--soft-ink)] text-sm leading-relaxed mb-8">
          {feature} kullanabilmek ve hedeflerinize daha hızlı ulaşmak için **Premium** üyeliğe geçmeniz gerekmektedir.
        </p>

        <div className="space-y-3">
          <Link 
            href="/dashboard/client/subscription"
            className="cta-primary w-full justify-center py-3.5 bg-amber-600 border-amber-700 hover:bg-amber-700 shadow-lg shadow-amber-600/10"
          >
            <Crown size={18} className="mr-2" /> Şimdi Yükselt
          </Link>
          
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
            <ShieldCheck size={12} /> Güvenli Ödeme & Anında Aktivasyon
          </div>
        </div>
      </div>
    </div>
  );
}
