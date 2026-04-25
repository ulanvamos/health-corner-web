import type { ClientRecord, DemoState } from "./demo-data";

export type ReminderType = "water" | "meal" | "measurement";
export type ReminderScope = "client" | "all";
export type MessageSender = "dietitian" | "client" | "system";

export type WorkspaceMessage = {
  id: string;
  clientId?: string;
  sender: MessageSender;
  body: string;
  sentAt: string;
  tone?: "neutral" | "positive" | "reminder";
  scope?: ReminderScope;
  status?: "sent" | "delivered" | "read";
};

export type WorkspaceNotification = {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  kind: ReminderType | "system";
  scope: ReminderScope;
};

export type PlanSection = {
  id: string;
  title: string;
  summary: string;
  emphasis: string;
  bullets: string[];
  status: "active" | "next" | "watch";
};

export type NutrientFact = {
  label: string;
  value: number;
  unit: string;
};

export type MealSlot = {
  id: string;
  name: string;
  timeLabel: string;
  description: string;
  ingredients: string[];
  macroSummary: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  nutrientFacts: NutrientFact[];
};

export type MenuDay = {
  id: string;
  label: string;
  title: string;
  note: string;
  meals: MealSlot[];
};

export type SubscriptionFeature = {
  title: string;
  detail: string;
  active: boolean;
};

export type SubscriptionHistoryItem = {
  id: string;
  title: string;
  dateLabel: string;
  status: string;
};

export type DietitianProfile = {
  name: string;
  title: string;
  clinic: string;
  responseWindow: string;
  focusAreas: string[];
  bio: string;
};

export type ClientWorkspace = {
  planSections: PlanSection[];
  menuDays: MenuDay[];
  subscriptionFeatures: SubscriptionFeature[];
  subscriptionHistory: SubscriptionHistoryItem[];
  dietitianProfile: DietitianProfile;
};

function createTimestamp(label: string) {
  return label;
}

export function createInitialMessages(): WorkspaceMessage[] {
  return [];
}

export function createInitialNotifications(): WorkspaceNotification[] {
  return [];
}

function buildPlanSections(client?: ClientRecord): PlanSection[] {
  if (!client) return [];
  const emphasis =
    client.goalType === "lose_weight"
      ? "Enerji açığını korurken tokluk hissini düşürmemek"
      : client.goalType === "gain_weight"
        ? "Öğün hacmini artırırken sindirimi yormamak"
        : "Dalgalanmayı azaltıp düzeni sabitlemek";

  return [
    {
      id: "phase-1",
      title: "Günlük denge planı",
      summary:
        "Ana ve ara öğün saatleri sabitlenir, gün içi enerji dağılımı korunur.",
      emphasis,
      bullets: [
        "Kahvaltı, öğle ve akşam öğünleri arasında 3-4 saat bırak.",
        "Ara öğünlerden en az biri protein destekli olsun.",
        "Akşam yemeğini geç saat yerine daha erken konumlandır.",
      ],
      status: "active",
    },
    {
      id: "phase-2",
      title: "Takip ve geri bildirim",
      summary: "Ölçüm, öğün uyumu ve su takibi aynı yerde izlenir.",
      emphasis: "Her hafta tek ölçüm, gün içinde görünür hatırlatma",
      bullets: [
        "Haftalık ölçümü aynı zaman aralığında gir.",
        "Mesaj ekranından öğün sapmalarını not veya fotoğrafla paylaş.",
        "Su, öğün ve ölçüm hatırlatmaları bildirim akışına düşer.",
      ],
      status: "next",
    },
    {
      id: "phase-3",
      title: "Esneklik alanı",
      summary:
        "Dışarıda yemek, yoğun günler ve sosyal öğünler için alternatif kurgu tutulur.",
      emphasis: "Plan bozuldu hissi yerine hızlı geri dönüş mantığı",
      bullets: [
        "Yoğun günler için kısa menü alternatifleri hazır tutulur.",
        "Atlanan öğünde telafi yerine bir sonraki öğün düzenlenir.",
        "Diyetisyen notları ayrı menü başlığından takip edilir.",
      ],
      status: "watch",
    },
  ];
}

function buildMenuDays(client?: ClientRecord): MenuDay[] {
  // Mock veriler kaldırıldı. Artık sadece veritabanından gelen gerçek veriler kullanılacak.
  return [];
}

function buildSubscriptionFeatures(client?: ClientRecord): SubscriptionFeature[] {
  const isPremium = client?.subscription?.plan === "premium";

  return [
    {
      title: "Detay plan ekranları",
      detail:
        "Planın aşamaları, yemek menüsü ve besin değerleri ayrı sayfalarda açılır.",
      active: true,
    },
    {
      title: "Diyetisyen mesajlaşması",
      detail:
        "Mesaj ekranından soru, öğün fotoğrafı ve kısa geri bildirim akışı sağlanır.",
      active: true,
    },
    {
      title: "Akıllı hatırlatma akışı",
      detail:
        "Su, öğün ve ölçüm dürtmeleri bildirim ve mesaj akışında birlikte görünür.",
      active: isPremium,
    },
    {
      title: "Abonelik araçları",
      detail:
        "Plan yükseltme, yenileme tarihi ve sahte ödeme geçmişi bu bölümde izlenir.",
      active: isPremium,
    },
  ];
}

function buildSubscriptionHistory(client?: ClientRecord): SubscriptionHistoryItem[] {
  if (!client) return [];
  return [
    {
      id: "payment-1",
      title: "Paket yenileme",
      dateLabel: client.subscription.renewal,
      status: client.subscription.plan === "free" ? "Süre doldu" : "Planlandı",
    },
    {
      id: "payment-2",
      title:
        client.subscription.plan === "premium"
          ? "Premium yükseltme denemesi"
          : client.subscription.plan === "basic"
            ? "Başlangıç üyeliği güncellemesi"
            : "Ücretsiz erişim dönemi",
      dateLabel: "5 Nisan 2026",
      status: "Tamamlandı",
    },
    {
      id: "payment-3",
      title: "Başlangıç üyeliği",
      dateLabel: "1 Mart 2026",
      status: "Aktif edildi",
    },
  ];
}

function buildDietitianProfile(
  dietitian: DemoState["dietitian"],
): DietitianProfile {
  return {
    name: dietitian.name,
    title: dietitian.title,
    clinic: "Health Corner Beslenme Stüdyosu",
    responseWindow: "Hafta içi 09:00 - 18:00 arasında aynı gün dönüş",
    focusAreas: [
      "Kilo yönetimi",
      "İnsülin direnci takibi",
      "Esnek öğün planlaması",
    ],
    bio: "Günlük takip akışını veriyle sadeleştirip sürdürülebilir beslenme düzeni kurmaya odaklanır.",
  };
}

export function buildClientWorkspace(
  client: ClientRecord | null,
  dietitian: DemoState["dietitian"],
): ClientWorkspace {
  return {
    planSections: buildPlanSections(client || undefined),
    menuDays: buildMenuDays(client || undefined),
    subscriptionFeatures: buildSubscriptionFeatures(client || undefined),
    subscriptionHistory: buildSubscriptionHistory(client || undefined),
    dietitianProfile: buildDietitianProfile(dietitian),
  };
}
