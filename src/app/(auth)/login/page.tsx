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
  }




          <div className="mt-12 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
            <ShieldCheck size={12} /> Supabase Secure Auth
          </div>
        </div>
      </div>
    </div>
  );
}
