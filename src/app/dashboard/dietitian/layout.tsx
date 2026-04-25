"use client";

import type { ReactNode } from "react";

import { DietitianDashboardShell } from "@/components/dietitian-dashboard-shell";

export default function DietitianDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DietitianDashboardShell>{children}</DietitianDashboardShell>;
}
