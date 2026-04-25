export type GoalType = "lose_weight" | "gain_weight" | "maintain";
export type SubscriptionPlan = "free" | "basic" | "premium";
export type SubscriptionStatus = "active" | "canceled" | "expired" | "trial";
export type AppointmentMode = "online" | "in_person";
export type AppointmentStatus = "pending" | "approved" | "completed" | "canceled";

export type Measurement = {
  id: string;
  weight: number;
  waist?: number;
  hip?: number;
  arm?: number;
  date: string;
  recordedAt: string;
};

export type DietPlan = {
  title: string;
  summary: string;
  updatedAt: string;
  coach: string;
};

export type Appointment = {
  id: string;
  clientId: string;
  dietitianId: string;
  clientName: string;
  time_label: string;
  type_label: string;
  mode: AppointmentMode;
  status: AppointmentStatus;
  requested_at: string;
  preferred_at: string | null;
};

export type ClientRecord = {
  id: string;
  userId: string;
  dietitianId: string;
  name: string;
  email: string;
  age: number;
  heightCm: number;
  goalType: GoalType;
  goalLabel: string;
  allergies: string[];
  chronicConditions: string[];
  targetSummary: string;
  status: string;
  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    renewal: string;
  };
  progressPercent: number;
  progressNote: string;
  measurements: Measurement[];
  currentPlan: DietPlan;
  reminders: string[];
  anamnesis?: any;
};

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

export type DemoState = {
  dietitian: {
    name: string;
    title: string;
    focusSummary: string;
  };
  clients: ClientRecord[];
  appointments: Appointment[];
  staff: StaffMember[];
};

// This is now just a blank initial state, NO MOCK DATA.
export const demoStateSeed: DemoState = {
  dietitian: {
    name: "Yükleniyor...",
    title: "Sistem Meşgul",
    focusSummary: "Veritabanı bağlantısı kuruluyor.",
  },
  clients: [],
  appointments: [],
  staff: [],
};
