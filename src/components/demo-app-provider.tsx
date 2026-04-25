"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { type User } from "@supabase/supabase-js";

import {
  demoStateSeed,
  type AppointmentMode,
  type AppointmentStatus,
  type ClientRecord,
  type DemoState,
  type GoalType,
} from "@/lib/demo-data";
import {
  buildClientWorkspace,
  type ClientWorkspace,
  type ReminderScope,
  type ReminderType,
  type WorkspaceMessage,
  type WorkspaceNotification,
  type PlanSection,
} from "@/lib/client-workspace";

type OnboardingInput = {
  name: string;
  email: string;
  age: number;
  heightCm: number;
  goalType: GoalType;
  allergies: string[];
  chronicConditions: string[];
  targetSummary: string;
};

type MeasurementSaveResult = {
  mode: "created" | "updated";
  message: string;
};

type DietitianMessageInput = {
  body: string;
  scope?: ReminderScope;
  clientId?: string;
};

export type UserRole = "client" | "dietitian" | "admin";
export type AccountStatus = "active" | "pending" | "rejected" | "suspended";

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: AccountStatus;
};

export type DietitianApplication = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialty: string;
  documentName: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
};

type RegisterClientInput = {
  email: string;
  password: string;
  name: string;
};

type RegisterDietitianInput = RegisterClientInput & {
  phone: string;
  licenseNumber: string;
  specialty: string;
  documentName: string;
};

function normalizeRole(value: unknown): UserRole | null {
  return value === "client" || value === "dietitian" || value === "admin"
    ? value
    : null;
}

function fallbackRoleForUser(user: User): UserRole {
  const metadataRole = normalizeRole(user.user_metadata?.role);
  if (metadataRole) return metadataRole;

  const email = user.email?.toLowerCase() ?? "";
  return "client";
}

function fallbackStatusForUser(user: User, role: UserRole): AccountStatus {
  const metadataStatus = user.user_metadata?.status;
  if (
    metadataStatus === "active" ||
    metadataStatus === "pending" ||
    metadataStatus === "rejected" ||
    metadataStatus === "suspended"
  ) {
    return metadataStatus;
  }

  if (role === "dietitian") {
    return "pending";
  }

  return "active";
}

function getUserDisplayName(user: User) {
  return (
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Kullanıcı"
  ).toString();
}

function buildFallbackProfile(user: User): UserProfile {
  const role = fallbackRoleForUser(user);
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: getUserDisplayName(user),
    role,
    status: fallbackStatusForUser(user, role),
  };
}

function buildApplicationFromUser(user: User): DietitianApplication | null {
  const role = fallbackRoleForUser(user);
  if (role !== "dietitian") return null;

  return {
    id: `application-${user.id}`,
    userId: user.id,
    fullName: getUserDisplayName(user),
    email: user.email ?? "",
    phone: String(user.user_metadata?.phone ?? ""),
    licenseNumber: String(user.user_metadata?.license_number ?? ""),
    specialty: String(user.user_metadata?.specialty ?? "Beslenme ve diyetetik"),
    documentName: String(user.user_metadata?.document_name ?? "Belge bekleniyor"),
    status: fallbackStatusForUser(user, role) === "active" ? "approved" : "pending",
    submittedAt: new Date(user.created_at).toLocaleDateString("tr-TR"),
  };
}

function buildClientFromProfile(profile: UserProfile): ClientRecord {
  return {
    id: `client-${profile.id}`,
    userId: profile.id,
    dietitianId: "",
    name: profile.fullName,
    email: profile.email,
    age: 0,
    heightCm: 0,
    goalType: "maintain",
    goalLabel: "Hedef belirlenmedi",
    allergies: [],
    chronicConditions: [],
    targetSummary: "Henüz hedef bilgisi girilmedi.",
    status: "Profil kurulumu bekliyor",
    subscription: {
      plan: "free",
      status: "trial",
      renewal: "Ücretsiz plan",
    },
    progressPercent: 0,
    progressNote: "Ölçüm ve anamnez bilgileri tamamlandığında takip başlayacak.",
    measurements: [],
    currentPlan: {
      title: "Plan bekleniyor",
      summary: "Diyetisyen eşleştirmesi sonrası kişisel plan hazırlanacak.",
      updatedAt: "Henüz güncellenmedi",
      coach: "Diyetisyen atanmadı",
    },
    reminders: ["Profil bilgilerini tamamla.", "İlk ölçümünü ekle."],
  };
}

async function resolveUserProfile(user: User): Promise<UserProfile> {
  const { data } = await supabase
    .from("users")
    .select("id, email, name, role")
    .eq("id", user.id)
    .maybeSingle();

  const fallback = buildFallbackProfile(user);
  const role = normalizeRole(data?.role) ?? fallback.role;

  return {
    id: user.id,
    email: String(data?.email ?? fallback.email),
    fullName: String(data?.name ?? fallback.fullName),
    role,
    status: "active",
  };
}

async function resolveUserRole(user: User): Promise<UserRole> {
  return (await resolveUserProfile(user)).role;
}

type DemoAppContextValue = {
  user: User | null;
  currentProfile: UserProfile | null;
  currentClient: ClientRecord | null;
  dietitianApplication: DietitianApplication | null;
  dietitianApplications: DietitianApplication[];
  state: DemoState;
  featuredClient: ClientRecord;
  workspace: ClientWorkspace;
  messages: WorkspaceMessage[];
  allMessages: WorkspaceMessage[];
  notifications: WorkspaceNotification[];
  isLoading: boolean;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (email: string, password: string, name: string) => Promise<UserProfile>;
  registerClient: (input: RegisterClientInput) => Promise<UserProfile>;
  registerDietitian: (input: RegisterDietitianInput) => Promise<UserProfile>;
  upsertPrimaryClient: (input: OnboardingInput) => Promise<void>;
  activatePremium: () => Promise<void>;
  addMeasurement: (
    weightKg: number,
    waistCm?: number,
  ) => Promise<MeasurementSaveResult>;
  sendClientMessage: (body: string) => Promise<void>;
  sendDietitianMessage: (input: DietitianMessageInput) => Promise<void>;
  sendReminder: (
    type: ReminderType,
    scope?: ReminderScope,
    delayMs?: number,
  ) => Promise<void>;
  requestAppointment: (mode: AppointmentMode) => Promise<void>;
  updatePlanSection: (id: string, updates: Omit<PlanSection, "id">) => Promise<void>;
  markMessageAsRead: (id: string) => Promise<void>;
  updateClientFocus: (clientId: string, targetSummary: string, progressNote: string) => Promise<void>;
  claimClient: (clientId: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, updates?: any) => Promise<void>;
  upsertPlanSection: (section: any) => Promise<void>;
  updateMenuMeal: (mealId: string, updates: any) => Promise<void>;
  updateMenuDay: (dayId: string, updates: any) => Promise<void>;
  updateSubscription: (plan: 'free' | 'basic' | 'premium') => Promise<void>;
  createDietitian: (data: { name: string, email: string, password?: string }) => Promise<void>;
  setTemporaryPassword: (userId: string, password: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  createInvitation: () => Promise<string>;
  registerWithInvitation: (data: { name: string, email: string, password: string, token: string }) => Promise<void>;
  isSeeded: boolean;
  resetDemo: () => Promise<void>;
  fetchData: () => Promise<void>;
};

const DemoAppContext = createContext<DemoAppContextValue | null>(null);

export function DemoAppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [dietitianApplication, setDietitianApplication] =
    useState<DietitianApplication | null>(null);
  const [currentRole, setRole] = useState<UserRole>("client");
  const [dbState, setDbState] = useState<DemoState | null>(null);
  const [dbMessages, setDbMessages] = useState<WorkspaceMessage[]>([]);
  const [dbNotifications, setDbNotifications] = useState<WorkspaceNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from Supabase
  const fetchData = async () => {
    if (!currentProfile) return;
    setIsLoading(true);
    try {
      console.log("DEBUG: fetchData starting for profile:", currentProfile.id);
      
      // 1. Fetch Dietitian User Info
      const { data: dietitianUser, error: dietitianError } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', currentProfile.id)
        .maybeSingle();

      if (dietitianError) console.error("DEBUG: dietitianError:", JSON.stringify(dietitianError));

      // 2. Fetch Clients (Simple Select)
      let clientsQuery = supabase.from('clients').select('*');
      if (currentProfile.role === 'dietitian') {
        // Filter logic can be re-enabled here if desired
      }
      const { data: clientsRaw, error: clientsError } = await clientsQuery;
      
      console.log("DEBUG: clientsRaw count:", clientsRaw?.length ?? 0);
      if (clientsError) console.error("DEBUG: clientsError:", JSON.stringify(clientsError));

      if (clientsRaw && clientsRaw.length > 0) {
        // 3. Fetch Related Data Separately
        const userIds = clientsRaw.map(c => c.user_id);
        
        const { data: usersRaw } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', userIds);

        // Fetch all subscriptions for simplicity to avoid matching issues
        const { data: subsRaw, error: subsError } = await supabase
          .from('subscriptions')
          .select('user_id, plan, status, ends_at');
        
        if (subsError) console.error("DEBUG: subsError details:", JSON.stringify(subsError));
        console.log("DEBUG: subsRaw total count:", subsRaw?.length ?? 0);

        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('*')
          .order('requested_at', { ascending: false });

        const { data: staffRaw } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'dietitian');

        const clientIds = clientsRaw.map(c => c.id);
        const { data: measurementsRaw } = await supabase
          .from('measurements')
          .select('*')
          .in('client_id', clientIds)
          .order('recorded_at', { ascending: false });

        const { data: anamnesisRaw } = await supabase
          .from('anamnesis')
          .select('*')
          .in('client_id', clientIds);

        // 4. Merge Data in Frontend
        setDbState({
          dietitian: {
            name: dietitianUser?.name || currentProfile.fullName,
            title: "Klinik Beslenme Uzmanı",
            focusSummary: "Beslenme Planı ve Takibi",
          },
          clients: clientsRaw.map(c => {
            const user = usersRaw?.find(u => u.id === c.user_id);
            const sub = subsRaw?.find(s => s.user_id === c.user_id);
            const clientMeasurements = (measurementsRaw || [])
              .filter(m => m.client_id === c.id)
              .map(m => ({
                id: m.id,
                weight: m.weight_kg,
                waist: m.waist_cm,
                hip: m.hip_cm,
                arm: m.arm_cm,
                date: new Date(m.recorded_at).toLocaleDateString("tr-TR"),
                recordedAt: m.recorded_at,
              }));
            const clientAnamnesis = (anamnesisRaw || []).find(a => a.client_id === c.id) || null;
            
            // Gerçek Diyet Başarısı Hesaplama (Kilo Hedefi İlerlemesi)
            let calculatedProgress = 0;
            
            const startWeight = clientMeasurements.length > 0 
              ? clientMeasurements[clientMeasurements.length - 1].weight // İlk girilen ölçüm
              : null;
            const currentWeight = clientMeasurements.length > 0 
              ? clientMeasurements[0].weight // En son girilen ölçüm
              : null;
            const targetWeight = clientAnamnesis?.target_weight;

            if (startWeight && currentWeight && targetWeight && startWeight !== targetWeight) {
              // Formül: (Mevcut - Başlangıç) / (Hedef - Başlangıç)
              const totalChangeNeeded = targetWeight - startWeight;
              const actualChange = currentWeight - startWeight;
              
              calculatedProgress = Math.round((actualChange / totalChangeNeeded) * 100);
              
              // İlerlemeyi 0-100 arasında sınırla (hedeften sapma veya aşma durumları için)
              if (calculatedProgress < 0) calculatedProgress = 0;
              if (calculatedProgress > 100) calculatedProgress = 100;
            }

            let calculatedReminders = c.reminders || [];
            // Eğer profil eksikse hala uyarı kalsın ama ilerleme barı kiloya baksın
            const hasBasicInfo = c.age > 0 && c.height_cm > 0 && !!clientAnamnesis && clientMeasurements.length > 0;
            if (hasBasicInfo) {
              calculatedReminders = calculatedReminders.filter((r: string) => !r.includes("Profil bilgilerini tamamla"));
            }

            return {
              id: c.id,
              userId: c.user_id,
              dietitianId: c.dietitian_user_id ?? "",
              name: user?.name ?? "Anonim",
              email: user?.email ?? "",
              age: c.age,
              heightCm: c.height_cm,
              goalType: c.goal_type as any,
              goalLabel: c.goal_label,
              allergies: c.allergies || [],
              chronicConditions: c.chronic_conditions || [],
              targetSummary: c.target_summary,
              status: c.status,
              subscription: { 
                plan: (sub?.plan as any) ?? 'free', 
                status: (sub?.status as any) ?? 'trial', 
                renewal: sub?.ends_at ? new Date(sub.ends_at).toLocaleDateString("tr-TR") : 'Ücretsiz plan' 
              },
              progressPercent: calculatedProgress,
              progressNote: c.progress_note,
              currentPlan: { 
                title: "Diyet Planı", 
                summary: "Kişiselleştirilmiş plan", 
                updatedAt: "20 Nisan 2026", 
                coach: dietitianUser?.name || "Diyetisyen" 
              },
              reminders: calculatedReminders,
              measurements: clientMeasurements,
              anamnesis: clientAnamnesis
            };
          }),
          appointments: (appointmentsData || []).map(a => ({
            id: a.id,
            clientId: a.client_id,
            dietitianId: a.dietitian_user_id,
            clientName: usersRaw?.find(u => u.id === clientsRaw.find(cl => cl.id === a.client_id)?.user_id)?.name ?? "Bilinmiyor",
            mode: a.mode as any,
            status: a.status as any,
            time_label: a.time_label,
            type_label: a.type_label,
            requested_at: a.requested_at,
            preferred_at: a.preferred_at
          })),
          staff: (staffRaw || []).map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            is_active: u.is_active
          })),
        });
      } else {
        const { data: staffRaw } = await supabase.from('users').select('*').eq('role', 'dietitian');
        // Handle empty clients state
        setDbState({
          dietitian: {
            name: dietitianUser?.name || currentProfile.fullName,
            title: "Klinik Beslenme Uzmanı",
            focusSummary: "Hazır ve Nazır",
          },
          clients: [],
          appointments: [],
          staff: (staffRaw || []).map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            is_active: u.is_active
          })),
        });
      }

      // 5. Messages and Notifications
      const { data: messages } = await supabase.from('messages').select('*').order('sent_at', { ascending: true });
      if (messages) {
        setDbMessages(messages.map(m => ({
          id: m.id,
          clientId: m.client_id,
          sender: m.sender_role,
          body: m.body,
          status: m.status,
          sentAt: new Date(m.sent_at).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          scope: m.scope,
        })));
      }

      const { data: notificationsData } = await supabase.from('notifications').select('*').order('sent_at', { ascending: false });
      if (notificationsData) {
        setDbNotifications(notificationsData.map(n => ({
          id: n.id,
          title: n.title,
          body: n.body,
          sentAt: new Date(n.sent_at).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          kind: n.kind as any,
          scope: n.scope as any,
        })));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessagesOnly = async () => {
    try {
      const { data: messages } = await supabase.from('messages').select('*').order('sent_at', { ascending: true });
      if (messages) {
        setDbMessages(messages.map(m => ({
          id: m.id,
          clientId: m.client_id,
          sender: m.sender_role,
          body: m.body,
          status: m.status,
          sentAt: new Date(m.sent_at).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          scope: m.scope,
        })));
      }
    } catch (err) {
      console.error("fetchMessagesOnly error:", err);
    }
  };

  useEffect(() => {
    async function syncAuthUser(nextUser: User | null) {
      setUser(nextUser);
      if (!nextUser) {
        setCurrentProfile(null);
        setDietitianApplication(null);
        setRole("client");
        return;
      }

      const profile = await resolveUserProfile(nextUser);
      setCurrentProfile(profile);
      setDietitianApplication(buildApplicationFromUser(nextUser));
      setRole(profile.role);
    }

    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      void syncAuthUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncAuthUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch data whenever currentProfile is loaded or changed
  useEffect(() => {
    if (currentProfile) {
      fetchData();
      
      const channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'measurements' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchData())
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentProfile]);

  const state = dbState || demoStateSeed;
  const currentClient = useMemo(() => {
    if (!currentProfile || currentProfile.role !== "client") return null;

    return (
      state.clients.find((client) => client.email === currentProfile.email) ??
      buildClientFromProfile(currentProfile)
    );
  }, [currentProfile, state.clients]);
  const featuredClient = useMemo(() => {
    return (
      state.clients[0] ??
      null
    );
  }, [currentClient, state.clients]);

  // Use the seed directly if not loaded
  const baseSeed = {
    dietitian: {
      name: "Dyt. Yükleniyor...",
      title: "Klinik Beslenme Uzmanı",
      focusSummary: "Veriler yüklenirken lütfen bekleyin.",
    },
    clients: [],
    appointments: [],
    staff: [],
  };

  const dietitianApplications = useMemo(() => {
    return dietitianApplication ? [dietitianApplication] : [];
  }, [dietitianApplication]);
  
  const workspace = useMemo(
    () => buildClientWorkspace(featuredClient, state.dietitian),
    [featuredClient, state.dietitian],
  );

  const value: DemoAppContextValue = {
    user,
    currentProfile,
    currentClient,
    dietitianApplication,
    dietitianApplications,
    state,
    featuredClient,
    workspace,
    messages: dbMessages.filter(m => m.clientId === featuredClient?.id),
    allMessages: dbMessages,
    notifications: dbNotifications,
    isLoading,
    isSeeded: !!dbState,
    currentRole,
    setRole,
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Oturum acilamadi.");

      const profile = await resolveUserProfile(data.user);
      setUser(data.user);
      setCurrentProfile(profile);
      setDietitianApplication(buildApplicationFromUser(data.user));
      setRole(profile.role);
      await fetchData();
      return profile;
    },
    register: async (email, password, name) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name, 
            full_name: name, 
            role: "client", 
            status: "active"
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        const profile = buildFallbackProfile(data.user);
        setUser(data.user);
        setCurrentProfile(profile);
        setDietitianApplication(null);
        setRole("client");
        await fetchData();
        return profile;
      }
      throw new Error("Hesap oluşturulamadı.");
    },
    registerClient: async ({ email, password, name }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name, 
            full_name: name, 
            role: "client", 
            status: "active"
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        const profile = buildFallbackProfile(data.user);
        setUser(data.user);
        setCurrentProfile(profile);
        setDietitianApplication(null);
        setRole("client");
        await fetchData();
        return profile;
      }
      throw new Error("Hesap oluşturulamadı.");
    },
    registerDietitian: async (input) => {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            name: input.name,
            full_name: input.name,
            role: "dietitian",
            status: "pending",
            phone: input.phone,
            license_number: input.licenseNumber,
            specialty: input.specialty,
            document_name: input.documentName,
          },
        },
      });
      if (error) throw error;
      if (data.user) {
        const profile = buildFallbackProfile(data.user);
        setUser(data.user);
        setCurrentProfile(profile);
        setDietitianApplication(buildApplicationFromUser(data.user));
        setRole("dietitian");
        await fetchData();
        return profile;
      }
      throw new Error("Başvuru hesabı oluşturulamadı.");
    },
    logout: async () => {
       await supabase.auth.signOut();
       setUser(null);
       setCurrentProfile(null);
       setDietitianApplication(null);
       setRole("client");
    },
    upsertPrimaryClient: async (input) => {
      console.log("Upsert client:", input);
    },
    activatePremium: async () => {
      console.log("Activate premium");
    },
    addMeasurement: async (weightKg, waistCm) => {
      await supabase.from('measurements').insert({
        client_id: featuredClient.id,
        weight_kg: weightKg,
        waist_cm: waistCm,
      });
      fetchData();
      return { mode: "created", message: "Ölçüm başarıyla kaydedildi." };
    },
    sendClientMessage: async (body) => {
      if (!featuredClient || !featuredClient.dietitianId) return;
      await supabase.from('messages').insert({
        client_id: featuredClient.id,
        dietitian_user_id: featuredClient.dietitianId,
        sender_role: 'client',
        body: body.trim(),
      });
      // fetchMessagesOnly() is called by the channel subscription, but we can call it here for faster feedback
      fetchMessagesOnly();
    },
    sendDietitianMessage: async ({ body, scope = "client", clientId }) => {
      const targetClientId = clientId || featuredClient?.id;
      if (!targetClientId || !currentProfile) return;
      await supabase.from('messages').insert({
        client_id: targetClientId,
        dietitian_user_id: currentProfile.id,
        sender_role: 'dietitian',
        body: body.trim(),
        scope,
      });
      fetchMessagesOnly();
    },
    sendReminder: async (type, scope = "client") => {
      await supabase.from('notifications').insert({
        client_id: featuredClient.id,
        dietitian_user_id: currentProfile?.id,
        title: "Hatırlatma",
        body: type === "water" ? "Su içmeyi unutma!" : type === "meal" ? "Öğün vakti!" : "Ölçüm zamanı!",
        kind: type,
        scope,
      });
    },
    requestAppointment: async (mode) => {
      await supabase.from('appointments').insert({
        client_id: featuredClient.id,
        dietitian_user_id: featuredClient.dietitianId || null,
        mode,
        time_label: "Beklemede",
        type_label: "Kontrol",
      });
      fetchData();
    },
    resetDemo: async () => {
      fetchData();
    },
    fetchData,
    updatePlanSection: async () => {},
    markMessageAsRead: async (id) => {
      await supabase.from('messages').update({ status: 'read' }).eq('id', id);
      fetchData();
    },
    updateClientFocus: async (clientId, targetSummary, progressNote) => {
      await supabase.from('clients').update({
        target_summary: targetSummary,
        progress_note: progressNote
      }).eq('id', clientId);
      fetchData();
    },
    claimClient: async (clientId) => {
      console.log("DEBUG: claimClient called for:", clientId);
      const { error: rpcError } = await supabase.rpc('claim_client', { target_client_id: clientId });
      
      if (rpcError) {
        console.warn("DEBUG: RPC claim_client failed, trying direct update:", rpcError);
        const { error: updateError } = await supabase.from('clients').update({ 
          dietitian_user_id: currentProfile?.id,
          status: 'active',
          goal_label: 'Aktif Danışan'
        }).eq('id', clientId);
        
        if (updateError) {
          console.error("DEBUG: Direct claim failed:", updateError);
          alert("HATA: Danışan üstlenilemedi! " + updateError.message);
        } else {
          alert("BAŞARILI: Danışan artık sizin listenizde!");
        }
      } else {
        alert("BAŞARILI: Danışan artık sizin listenizde!");
      }
      
      console.log("DEBUG: Claim finished, fetching data...");
      await fetchData();
    },
    updateAppointmentStatus: async (id, status, updates = {}) => {
      console.log(`DEBUG: updateAppointmentStatus called for ID: ${id}, status: ${status}`, updates);
      const { error } = await supabase.from('appointments').update({ status, ...updates }).eq('id', id);
      if (error) {
        console.error("DEBUG: updateAppointmentStatus error:", error.message);
        console.error("DEBUG: error details:", error.details);
        console.error("DEBUG: error hint:", error.hint);
      }
      await fetchData();
    },
    upsertPlanSection: async (section) => {
      if (section.id && section.id.length > 10) {
        await supabase.from('client_plan_sections').update({
          title: section.title,
          summary: section.summary,
          emphasis: section.emphasis,
          bullets: section.bullets,
          status: section.status
        }).eq('id', section.id);
      } else {
        await supabase.from('client_plan_sections').insert({
          client_id: section.clientId,
          title: section.title,
          summary: section.summary,
          emphasis: section.emphasis,
          bullets: section.bullets,
          status: section.status,
          sort_order: 10
        });
      }
      fetchData();
    },
    updateMenuMeal: async (mealId, updates) => {
      await supabase.from('client_menu_meals').update({
        name: updates.name,
        description: updates.description,
        ingredients: updates.ingredients,
        calories: updates.calories
      }).eq('id', mealId);
      fetchData();
    },
    updateMenuDay: async (dayId, updates) => {
      await supabase.from('client_menu_days').update({
        label: updates.label,
        title: updates.title,
        note: updates.note
      }).eq('id', dayId);
      fetchData();
    },
    updateSubscription: async (plan) => {
      await supabase.from('subscriptions').update({ plan }).eq('id', user?.id);
      fetchData();
    },
    createDietitian: async (data) => {
      console.log("DEBUG: Creating dietitian via RPC:", data);
      const { error } = await supabase.rpc('admin_create_dietitian', {
        new_email: data.email,
        new_password: data.password || 'temp123',
        new_name: data.name
      });
      
      if (error) {
        console.error("DEBUG: createDietitian RPC error:", error);
        throw error;
      }
      await fetchData();
    },
    setTemporaryPassword: async (userId, password) => {
      console.log(`DEBUG: Setting temp password via RPC for ${userId}`);
      const { error } = await supabase.rpc('admin_set_user_password', {
        target_user_id: userId,
        new_password: password
      });
      
      if (error) {
        console.error("RPC Error:", error.message);
        // Fallback to updating public.users only if RPC fails (though it shouldn't)
        const { error: dbError } = await supabase
          .from('users')
          .update({ temp_password: password })
          .eq('id', userId);
        if (dbError) throw dbError;
      }
      await fetchData();
    },
    updatePassword: async (password) => {
      console.log("DEBUG: Updating password");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      // Also clear the temp_password in public.users if it exists
      if (user) {
        await supabase.from('users').update({ temp_password: null }).eq('id', user.id);
      }
    },
    createInvitation: async () => {
      const { data, error } = await supabase.rpc('create_dietitian_invitation');
      if (error) throw error;
      return data as string;
    },
    registerWithInvitation: async ({ name, email, password, token }) => {
      // 1. Token geçerliliğini kontrol et
      const { data: invite, error: inviteError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      
      if (inviteError || !invite) {
        throw new Error("Geçersiz veya süresi dolmuş davetiye linki.");
      }

      // 2. Auth kaydı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: 'dietitian' }
        }
      });

      if (authError || !authData.user) throw authError;

      // 3. public.users kaydı oluştur
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name,
          email,
          role: 'dietitian' as any,
          is_active: true
        });
      
      if (userError) throw userError;

      // 4. Token'ı kullanıldı olarak işaretle
      await supabase
        .from('invitations')
        .update({ is_used: true })
        .eq('token', token);
      
      await fetchData();
    },
  };

  return (
    <DemoAppContext.Provider value={value}>{children}</DemoAppContext.Provider>
  );
}

export function useDemoApp() {
  const context = useContext(DemoAppContext);
  if (!context) {
    throw new Error("useDemoApp must be used within DemoAppProvider");
  }
  return context;
}
