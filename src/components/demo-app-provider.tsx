"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { type User } from "@supabase/supabase-js";

import {
  demoStateSeed,
  type AppointmentMode,
  type AppointmentStatus,
  type ClientRecord,
  type DemoState,
  type GoalType,
  type SubscriptionPlan,
  type SubscriptionStatus,
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
  targetWeight?: number;
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

type AppointmentUpdateInput = Partial<{
  dietitian_user_id: string | null;
  mode: AppointmentMode;
  scheduled_at: string | null;
  preferred_at: string | null;
  time_label: string;
  type_label: string;
  cancellation_reason: string | null;
}>;

type PlanSectionInput = Omit<PlanSection, "id"> & {
  id?: string;
  clientId: string;
};

type MenuMealUpdateInput = Partial<{
  name: string;
  description: string;
  ingredients: string[];
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  nutrient_facts: unknown;
}>;

type MenuDayUpdateInput = Partial<{
  label: string;
  title: string;
  note: string;
}>;

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
  authChecked: boolean;
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
  updateAppointmentStatus: (id: string, status: AppointmentStatus, updates?: AppointmentUpdateInput) => Promise<void>;
  upsertPlanSection: (section: PlanSectionInput) => Promise<void>;
  updateMenuMeal: (mealId: string, updates: MenuMealUpdateInput) => Promise<void>;
  updateMenuDay: (dayId: string, updates: MenuDayUpdateInput) => Promise<void>;
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
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [dietitianApplication, setDietitianApplication] =
    useState<DietitianApplication | null>(null);
  const [currentRole, setRole] = useState<UserRole>("client");
  const [dbState, setDbState] = useState<DemoState | null>(null);
  const [dbMessages, setDbMessages] = useState<WorkspaceMessage[]>([]);
  const [dbNotifications, setDbNotifications] = useState<WorkspaceNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const clientsRef = useRef<ClientRecord[]>([]);

  useEffect(() => {
    clientsRef.current = dbState?.clients ?? [];
  }, [dbState?.clients]);

  // Fetch initial data from Supabase
  const fetchData = async (profile: UserProfile | null = currentProfile) => {
    if (!profile) return;
    setIsLoading(true);
    try {
      // 1. Fetch profile and visible clients in parallel.
      let clientsQuery = supabase.from('clients').select('*');
      if (profile.role === 'dietitian') {
        clientsQuery = clientsQuery.or(`dietitian_user_id.eq.${profile.id},dietitian_user_id.is.null`);
      } else if (profile.role === 'client') {
        clientsQuery = clientsQuery.eq('user_id', profile.id);
      }

      const [
        { data: dietitianUser, error: dietitianError },
        { data: clientsRaw, error: clientsError },
      ] = await Promise.all([
        supabase
          .from('users')
          .select('name, role')
          .eq('id', profile.id)
          .maybeSingle(),
        clientsQuery,
      ]);

      if (dietitianError) console.error("Profile fetch error:", JSON.stringify(dietitianError));
      const clients = clientsRaw ?? [];
      
      if (clientsError) console.error("Clients fetch error:", JSON.stringify(clientsError));

      if (clients.length > 0) {
        // 3. Fetch Related Data Separately
        const userIds = clients.map(c => c.user_id);
        
        let appointmentsQuery = supabase.from('appointments').select('*');
        const firstClientId = clients[0]?.id ?? null;
        if (profile.role === 'dietitian') {
          appointmentsQuery = appointmentsQuery.or(`dietitian_user_id.eq.${profile.id},dietitian_user_id.is.null`);
        } else if (profile.role === 'client' && firstClientId) {
          appointmentsQuery = appointmentsQuery.eq('client_id', firstClientId);
        }
        const clientIds = clients.map(c => c.id);
        const [
          { data: usersRaw },
          { data: subsRaw, error: subsError },
          { data: appointmentsData },
          { data: staffRaw },
          { data: measurementsRaw },
          { data: anamnesisRaw },
        ] = await Promise.all([
          supabase
            .from('users')
            .select('id, name, email')
            .in('id', userIds),
          supabase
            .from('subscriptions')
            .select('user_id, plan, status, ends_at'),
          appointmentsQuery.order('requested_at', { ascending: false }),
          supabase
            .from('users')
            .select('*')
            .eq('role', 'dietitian'),
          supabase
            .from('measurements')
            .select('*')
            .in('client_id', clientIds)
            .order('recorded_at', { ascending: false }),
          supabase
            .from('anamnesis')
            .select('*')
            .in('client_id', clientIds),
        ]);
        
        if (subsError) console.error("Subscriptions fetch error:", JSON.stringify(subsError));

        // 4. Merge Data in Frontend
        setDbState({
          dietitian: {
            name: dietitianUser?.name || profile.fullName,
            title: "Klinik Beslenme Uzmanı",
            focusSummary: "Beslenme planı ve takibi",
          },
          clients: clients.map(c => {
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
              goalType: c.goal_type as GoalType,
              goalLabel: c.goal_label,
              allergies: c.allergies || [],
              chronicConditions: c.chronic_conditions || [],
              targetSummary: c.target_summary,
              status: c.status,
              subscription: { 
                plan: (sub?.plan as SubscriptionPlan | undefined) ?? 'free', 
                status: (sub?.status as SubscriptionStatus | undefined) ?? 'trial', 
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
            clientName: usersRaw?.find(u => u.id === clients.find(cl => cl.id === a.client_id)?.user_id)?.name ?? "Bilinmiyor",
            mode: a.mode as AppointmentMode,
            status: a.status as AppointmentStatus,
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
            name: dietitianUser?.name || profile.fullName,
            title: "Klinik Beslenme Uzmanı",
            focusSummary: "Danışan takibi hazır",
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
      let messagesQuery = supabase.from('messages').select('*');
      const activeClientId = clients[0]?.id ?? null;
      if (profile.role === 'client' && !activeClientId) {
        setDbMessages([]);
        setDbNotifications([]);
        return;
      }

      if (profile.role === 'dietitian') {
        messagesQuery = messagesQuery.eq('dietitian_user_id', profile.id);
      } else if (profile.role === 'client' && activeClientId) {
        messagesQuery = messagesQuery.eq('client_id', activeClientId);
      }
      
      let notificationsQuery = supabase.from('notifications').select('*');
      if (profile.role === 'dietitian') {
        notificationsQuery = notificationsQuery.eq('dietitian_user_id', profile.id);
      } else if (profile.role === 'client' && activeClientId) {
        notificationsQuery = notificationsQuery.eq('client_id', activeClientId);
      }

      const [
        { data: messages },
        { data: notificationsData },
      ] = await Promise.all([
        messagesQuery.order('sent_at', { ascending: true }),
        notificationsQuery.order('sent_at', { ascending: false }),
      ]);
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

      if (notificationsData) {
        setDbNotifications(notificationsData.map(n => ({
          id: n.id,
          title: n.title,
          body: n.body,
          sentAt: new Date(n.sent_at).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          kind: n.kind as WorkspaceNotification["kind"],
          scope: n.scope as ReminderScope,
        })));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessagesOnly = async (
    profile: UserProfile | null = currentProfile,
    clients: ClientRecord[] = clientsRef.current,
  ) => {
    if (!profile) return;
    try {
      let messagesQuery = supabase.from('messages').select('*');
      const activeClientId = clients[0]?.id ?? null;

      if (profile.role === 'dietitian') {
        messagesQuery = messagesQuery.eq('dietitian_user_id', profile.id);
      } else if (profile.role === 'client') {
        if (!activeClientId) {
          setDbMessages([]);
          return;
        }
        messagesQuery = messagesQuery.eq('client_id', activeClientId);
      }

      const { data: messages } = await messagesQuery.order('sent_at', { ascending: true });
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
        setIsLoading(false);
        setAuthChecked(true);
        return;
      }

      const profile = await resolveUserProfile(nextUser);
      setCurrentProfile(profile);
      setDietitianApplication(buildApplicationFromUser(nextUser));
      setRole(profile.role);
      setAuthChecked(true);
      // fetchData will be triggered by useEffect and set isLoading to false
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
      queueMicrotask(() => {
        void fetchData(currentProfile);
      });
      
      const channel = supabase
        .channel(`db-changes-${currentProfile.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
          fetchMessagesOnly(currentProfile, clientsRef.current);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchData(currentProfile))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchData(currentProfile))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => fetchData(currentProfile))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'measurements' }, () => fetchData(currentProfile))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchData(currentProfile))
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
  }, [state.clients]);

  // Global Auth Guard Redirect
  useEffect(() => {
    if (!authChecked) return;
    
    const isDashboardRoute = pathname?.startsWith('/dashboard');
    const isAuthRoute = pathname === '/login' || pathname === '/onboarding' || pathname === '/register-dietitian' || pathname === '/register-client';
    if (isDashboardRoute && !currentProfile) {
      router.push('/login');
    }
    
    // Redirect to dashboard if logged in and trying to access auth pages
    if (isAuthRoute && currentProfile) {
       router.push(`/dashboard/${currentProfile.role}`);
    }
  }, [authChecked, currentProfile, pathname, router]);

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
    authChecked,
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
      await fetchData(profile);
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
        await fetchData(profile);
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
        await fetchData(profile);
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
        await fetchData(profile);
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
      if (!currentProfile) return;
      
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .update({
          age: input.age,
          height_cm: input.heightCm,
          goal_type: input.goalType,
          allergies: input.allergies,
          chronic_conditions: input.chronicConditions,
          target_summary: input.targetSummary
        })
        .eq('user_id', currentProfile.id)
        .select()
        .single();
        
      if (clientError) {
        console.error("Error updating client:", clientError);
        return;
      }
      
      if (clientData) {
        const { error: anamnesisError } = await supabase
          .from('anamnesis')
          .upsert({
            client_id: clientData.id,
            age: input.age,
            height_cm: input.heightCm,
            target_weight: input.targetWeight,
            allergies: input.allergies.join(", "),
            diseases: input.chronicConditions.join(", "),
            goal_type: input.goalType
          }, { onConflict: 'client_id' });
          
        if (anamnesisError) {
          console.error("Error updating anamnesis:", anamnesisError);
        }
      }
      fetchData();
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
      const { data, error } = await supabase
        .from('appointments')
        .update({ status, ...updates })
        .eq('id', id)
        .select('id')
        .maybeSingle();
      if (error) {
        console.error("DEBUG: updateAppointmentStatus error:", error.message);
        console.error("DEBUG: error details:", error.details);
        console.error("DEBUG: error hint:", error.hint);
        throw error;
      }
      if (!data) {
        throw new Error("Randevu güncellenemedi. Talep başka bir diyetisyen tarafından alınmış veya yetkiniz kalmamış olabilir.");
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
      if (!user) return;
      await supabase.from('subscriptions').update({ plan }).eq('user_id', user.id);
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
      
      // Public users is admin-only for direct updates; use the narrow RPC for this field.
      if (user) {
        const { error: clearError } = await supabase.rpc('clear_own_temp_password');
        if (clearError) throw clearError;
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
          role: 'dietitian',
          is_active: true
        });
      
      if (userError) throw userError;

      // 4. Token'ı kullanıldı olarak işaretle
      const { error: markError } = await supabase.rpc('mark_dietitian_invitation_used', {
        invitation_token: token,
      });
      if (markError) throw markError;
      
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
