"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemoApp } from "@/components/demo-app-provider";

export default function RootPage() {
  const router = useRouter();
  const { currentProfile, isSeeded, authChecked } = useDemoApp();

  useEffect(() => {
    if (!authChecked) return;

    if (!currentProfile) {
      router.push("/login");
    } else if (isSeeded || currentProfile.role === "admin") {
      router.push(`/dashboard/${currentProfile.role}`);
    }
  }, [currentProfile, authChecked, isSeeded, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-12 h-12 bg-[var(--accent)] rounded-2xl" />
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">Health Corner Clinic</div>
      </div>
    </div>
  );
}
