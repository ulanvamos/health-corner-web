"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { useDemoApp } from "@/components/demo-app-provider";
import type { GoalType } from "@/lib/demo-data";

const goals: Array<{ value: GoalType; label: string }> = [
  { value: "lose_weight", label: "Kilo vermek istiyorum" },
  { value: "gain_weight", label: "Kas / kilo kazanmak istiyorum" },
  { value: "maintain", label: "Kilomu korumak ve düzenimi toplamak istiyorum" },
];

export default function OnboardingPage() {
  const { featuredClient, upsertPrimaryClient } = useDemoApp();
  const [name, setName] = useState(featuredClient.name);
  const [email, setEmail] = useState(featuredClient.email);
  const [age, setAge] = useState(String(featuredClient.age));
  const [heightCm, setHeightCm] = useState(String(featuredClient.heightCm));
  const [goalType, setGoalType] = useState<GoalType>(featuredClient.goalType);
  const [allergies, setAllergies] = useState(featuredClient.allergies.join(", "));
  const [conditions, setConditions] = useState(
    featuredClient.chronicConditions.join(", "),
  );
  const [targetSummary, setTargetSummary] = useState(featuredClient.targetSummary);
  const [saved, setSaved] = useState(false);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eff7f1_0%,#e3efe7_100%)] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">İlk değerlendirme</p>
            <h1 className="mt-3 text-4xl font-serif leading-none text-[var(--ink)] sm:text-5xl">
              Bilgilerini tamamla, sürecini kişiselleştir.
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--soft-ink)] sm:text-base">
              Sağlık öykün, hedefin ve günlük düzenin doğrultusunda sana uygun
              planın hazırlanabilmesi için temel bilgilerini paylaş.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(47,44,40,0.12)] px-4 py-3 text-sm text-[var(--soft-ink)] transition hover:bg-white"
          >
            <ArrowLeft size={16} />
            Ana sayfaya dön
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-white/80 bg-[var(--surface)] p-5 shadow-[0_20px_90px_rgba(70,112,85,0.08)] backdrop-blur sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[var(--ink)]">
                  Ad soyad
                </span>
                <input
                  className="w-full rounded-2xl border border-[rgba(47,44,40,0.1)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-[var(--ink)]">
                  E-posta
                </span>
                <input
                  className="w-full rounded-2xl border border-[rgba(47,44,40,0.1)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-[var(--ink)]">
                  Yaş
                </span>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-[rgba(47,44,40,0.1)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-[var(--ink)]">
                  Boy (cm)
                </span>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-[rgba(47,44,40,0.1)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  value={heightCm}
                  onChange={(event) => setHeightCm(event.target.value)}
                />
              </label>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-sm font-semibold text-[var(--ink)]">Hedef</p>
              {goals.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setGoalType(goal.value)}
                  className={`flex w-full items-center justify-between rounded-[1.4rem] border px-4 py-4 text-left transition ${
                    goalType === goal.value
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[rgba(47,44,40,0.08)] bg-white"
                  }`}
                >
                  <span className="text-sm font-medium text-[var(--ink)]">
                    {goal.label}
                  </span>
                  {goalType === goal.value ? <Check size={18} /> : null}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[var(--ink)]">
                  Alerjiler
                </span>
                <textarea
                  rows={4}
                  className="w-full rounded-2xl border border-[rgba(47,44,40,0.1)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  value={allergies}
                  onChange={(event) => setAllergies(event.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-[var(--ink)]">
                  Kronik durumlar
                </span>
                <textarea
                  rows={4}
                  className="w-full rounded-2xl border border-[rgba(47,44,40,0.1)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  value={conditions}
                  onChange={(event) => setConditions(event.target.value)}
                />
              </label>
            </div>

            <label className="mt-6 block space-y-2">
              <span className="text-sm font-semibold text-[var(--ink)]">
                Hedef özeti
              </span>
              <textarea
                rows={4}
                className="w-full rounded-2xl border border-[rgba(47,44,40,0.1)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                value={targetSummary}
                onChange={(event) => setTargetSummary(event.target.value)}
              />
            </label>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                className="cta-primary"
                onClick={async () => {
                  await upsertPrimaryClient({
                    name,
                    email,
                    age: Number(age),
                    heightCm: Number(heightCm),
                    goalType,
                    allergies: allergies
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                    chronicConditions: conditions
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                    targetSummary,
                  });
                  setSaved(true);
                }}
              >
                Bilgileri kaydet
              </button>

              <Link href="/dashboard/client" className="cta-secondary">
                Danışan alanına git
                <ArrowRight size={18} />
              </Link>
            </div>

            {saved ? (
              <p className="mt-4 text-sm text-[var(--accent)]">
                Bilgilerin kaydedildi. Takip alanın güncellendi.
              </p>
            ) : null}
          </section>

          <aside className="rounded-[2rem] bg-[linear-gradient(180deg,#1c3d2e,#163227)] p-5 text-[var(--paper)] sm:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">
              Neden bu bilgiler istenir?
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-white/70">
              <li>Beslenme planı kişisel ihtiyaçlarına göre şekillendirilir.</li>
              <li>Ölçüm ve hedef takibi daha anlamlı hale gelir.</li>
              <li>Randevu ve iletişim süreci daha düzenli ilerler.</li>
            </ul>

            <div className="mt-8 rounded-[1.6rem] bg-white/8 p-5">
              <p className="text-lg font-semibold">İlk değerlendirme içeriği</p>
              <p className="mt-3 text-sm leading-7 text-white/70">
                Profil bilgileri, sağlık öyküsü, hedef, alerji ve kronik durum
                alanları ilk görüşmenin daha doğru planlanmasına yardımcı olur.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
