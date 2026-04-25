"use client";

import type { ReactNode } from "react";
import { DietitianDashboardShell } from "@/components/dietitian-dashboard-shell";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DietitianDashboardShell>{children}</DietitianDashboardShell>;
}
