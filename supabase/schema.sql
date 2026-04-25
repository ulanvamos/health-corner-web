-- Supabase Schema Dump for healtcorner project
-- Generated: 2026-04-26

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- ENUMS
CREATE TYPE public.user_role AS ENUM ('dietitian', 'client', 'admin');
CREATE TYPE public.appointment_mode AS ENUM ('online', 'in_person');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'approved', 'completed', 'canceled', 'archived');
CREATE TYPE public.goal_type AS ENUM ('lose_weight', 'gain_weight', 'maintain');
CREATE TYPE public.message_scope AS ENUM ('client', 'all');
CREATE TYPE public.message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE public.message_tone AS ENUM ('neutral', 'positive', 'reminder');
CREATE TYPE public.notification_kind AS ENUM ('water', 'meal', 'measurement', 'system');
CREATE TYPE public.plan_section_status AS ENUM ('active', 'next', 'watch');
CREATE TYPE public.sender_role AS ENUM ('dietitian', 'client', 'system');
CREATE TYPE public.subscription_plan AS ENUM ('free', 'basic', 'premium');
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'expired', 'trial');

-- TABLES
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.user_role NOT NULL,
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    temp_password text,
    bio text,
    avatar_url text,
    title text DEFAULT 'Diyetisyen'::text
);

CREATE TABLE public.clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE REFERENCES auth.users(id),
    dietitian_user_id uuid REFERENCES public.users(id),
    goal_type public.goal_type,
    age integer,
    height_cm integer,
    allergies text[] DEFAULT '{}'::text[],
    chronic_conditions text[] DEFAULT '{}'::text[],
    target_summary text,
    public_id text UNIQUE NOT NULL,
    goal_label text,
    status text NOT NULL,
    progress_percent integer DEFAULT 0,
    progress_note text,
    reminders text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    current_weight numeric,
    waist_cm numeric,
    hip_cm numeric,
    arm_cm numeric,
    gender text,
    birth_date date
);

CREATE TABLE public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE REFERENCES auth.users(id),
    plan public.subscription_plan NOT NULL,
    status public.subscription_status NOT NULL,
    starts_at timestamp with time zone DEFAULT now(),
    ends_at timestamp with time zone,
    assigned_by uuid REFERENCES public.users(id),
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.measurements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id),
    weight_kg numeric NOT NULL,
    waist_cm numeric,
    hip_cm numeric,
    arm_cm numeric,
    recorded_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.diet_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id),
    title text NOT NULL,
    summary text NOT NULL,
    is_active boolean DEFAULT true,
    updated_by uuid REFERENCES public.users(id),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.client_plan_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id),
    sort_order integer NOT NULL,
    title text NOT NULL,
    summary text NOT NULL,
    emphasis text NOT NULL,
    bullets text[] DEFAULT '{}'::text[],
    status public.plan_section_status NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.client_menu_days (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id),
    sort_order integer NOT NULL,
    label text NOT NULL,
    title text NOT NULL,
    note text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.client_menu_meals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id uuid REFERENCES public.client_menu_days(id),
    sort_order integer NOT NULL,
    name text NOT NULL,
    time_label text NOT NULL,
    description text NOT NULL,
    ingredients text[] DEFAULT '{}'::text[],
    calories integer,
    protein integer,
    carbs integer,
    fat integer,
    nutrient_facts jsonb,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id),
    dietitian_user_id uuid REFERENCES public.users(id),
    sender_role public.sender_role NOT NULL,
    body text NOT NULL,
    tone public.message_tone DEFAULT 'neutral'::public.message_tone,
    status public.message_status DEFAULT 'sent'::public.message_status,
    scope public.message_scope DEFAULT 'client'::public.message_scope,
    sent_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id),
    dietitian_user_id uuid REFERENCES public.users(id),
    title text NOT NULL,
    body text NOT NULL,
    kind public.notification_kind NOT NULL,
    scope public.message_scope DEFAULT 'client'::public.message_scope,
    sent_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id),
    dietitian_user_id uuid REFERENCES public.users(id),
    mode public.appointment_mode NOT NULL,
    status public.appointment_status DEFAULT 'pending'::public.appointment_status,
    requested_at timestamp with time zone DEFAULT now(),
    scheduled_at timestamp with time zone,
    time_label text NOT NULL,
    type_label text NOT NULL,
    cancellation_reason text,
    preferred_at timestamp with time zone
);

CREATE TABLE public.invitations (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    token text UNIQUE NOT NULL,
    role public.user_role DEFAULT 'dietitian'::public.user_role,
    expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
    is_used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.diet_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dietitian_id uuid REFERENCES public.users(id),
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.diet_template_days (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id uuid REFERENCES public.diet_templates(id),
    label text NOT NULL,
    sort_order integer,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.diet_template_meals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id uuid REFERENCES public.diet_template_days(id),
    name text NOT NULL,
    time_label text,
    description text,
    ingredients text[] DEFAULT '{}'::text[],
    sort_order integer,
    created_at timestamp with time zone DEFAULT now()
);

-- FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  new_role public.user_role;
BEGIN
  new_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'client'::public.user_role);
  
  INSERT INTO public.users (id, email, name, role, is_active)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), new_role, true)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name;

  IF new_role = 'client' THEN
    INSERT INTO public.clients (
      user_id, 
      dietitian_user_id,
      goal_type, 
      age, 
      height_cm, 
      allergies, 
      chronic_conditions, 
      target_summary,
      public_id,
      goal_label,
      status,
      progress_percent,
      progress_note,
      reminders
    )
    VALUES (
      NEW.id,
      NULL,
      NULL,
      NULL,
      NULL,
      ARRAY['Yok'],
      ARRAY['Yok'],
      'Profil bilgileri bekleniyor.',
      'CL-' || upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6)),
      'Yeni Kayıt',
      'active',
      0,
      'Lütfen profilinizi tamamlayın.',
      ARRAY['Profil bilgilerini tamamla.']
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_premium_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF (new.plan = 'premium' AND new.status = 'active') THEN
    INSERT INTO public.clients (
      user_id, 
      dietitian_user_id, 
      goal_type, 
      age, 
      height_cm, 
      target_summary, 
      public_id, 
      goal_label, 
      status, 
      progress_percent, 
      progress_note
    )
    VALUES (
      new.user_id, 
      NULL,
      'maintain',
      25,
      170,
      'Premium abonelik ile aktifleşti.',
      'PRM-' || substr(new.user_id::text, 1, 5),
      'Premium Üye',
      'active',
      0,
      'Abonelik aktif, diyetisyen seçimi/ataması bekleniyor.'
    )
    ON CONFLICT (user_id) DO UPDATE SET 
      goal_label = 'Premium Üye';
  END IF;
  RETURN new;
END;
$function$;

-- TRIGGERS
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER on_subscription_updated
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_premium_subscription();

-- RLS POLICIES (Example set)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on users" ON public.users FOR SELECT USING (true);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own clients" ON public.clients FOR SELECT USING (
    (auth.uid() = user_id) OR 
    (auth.uid() = dietitian_user_id) OR 
    ((dietitian_user_id IS NULL) AND ((SELECT role FROM public.users WHERE id = auth.uid()) = 'dietitian'))
);

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_diet_plans" ON public.diet_plans FOR SELECT USING (
    is_admin() OR 
    (client_id IN (SELECT id FROM public.clients WHERE dietitian_user_id = auth.uid())) OR 
    (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()))
);
