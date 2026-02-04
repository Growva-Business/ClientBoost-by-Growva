-- ============================================
-- SALON CRM - FULL ENTERPRISE MASTER SCHEMA
-- ============================================

-- 1. EXTENSIONS
-- Run this first and alone!


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. CORE INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.countries (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT,
    name_fr TEXT,
    phone_prefix TEXT NOT NULL,
    currency TEXT NOT NULL,
    currency_symbol TEXT NOT NULL,
    default_language TEXT DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS public.salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    logo_url TEXT,
    brand_color TEXT DEFAULT '#6366f1',
    country_code TEXT REFERENCES public.countries(code),
    currency TEXT NOT NULL,
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar', 'fr')),
    timezone TEXT DEFAULT 'UTC',
    tax_percent NUMERIC(5,2) DEFAULT 0,
    package TEXT NOT NULL CHECK (package IN ('basic', 'advanced', 'pro')),
    whatsapp_provider TEXT DEFAULT 'manual' CHECK (whatsapp_provider IN ('manual', 'twilio', 'meta_cloud')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'salon_admin', 'staff')),
    salon_id UUID REFERENCES public.salons(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OPERATIONS & CATALOG
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT,
    name_fr TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    name_ar TEXT,
    name_fr TEXT,
    description TEXT,
    duration INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT,
    name_fr TEXT,
    description TEXT,
    original_price NUMERIC(10,2) NOT NULL,
    discounted_price NUMERIC(10,2) NOT NULL,
    valid_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.package_services (
    package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    PRIMARY KEY (package_id, service_id)
);

-- 4. STAFFING
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    commission_percent NUMERIC(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff_services (
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    PRIMARY KEY (staff_id, service_id)
);

-- 5. CLIENTS & CRM
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    age_group TEXT CHECK (age_group IN ('under16', '16-25', '26-45', '45-60', '60+')),
    source TEXT DEFAULT 'online' CHECK (source IN ('online', 'walk_in')),
    loyalty_points INTEGER DEFAULT 0,
    total_spent NUMERIC(10,2) DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    last_visit TIMESTAMPTZ,
    last_whatsapp_reply TIMESTAMPTZ,
    notes TEXT,
    opt_in BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id),
    staff_id UUID REFERENCES public.staff(id),
    appointment_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    total_price NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    final_price NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    confirmation_sent BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MESSAGING ENGINE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id),
    client_phone TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('confirmation', 'reminder', 'promotion', 'receipt', 'custom')),
    content TEXT NOT NULL,
    provider TEXT DEFAULT 'manual' CHECK (provider IN ('manual', 'twilio', 'meta_cloud')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'queued')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.message_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id),
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
    priority INTEGER DEFAULT 3,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.daily_message_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    used_confirmation INTEGER DEFAULT 0,
    used_reminder INTEGER DEFAULT 0,
    used_promotion INTEGER DEFAULT 0,
    UNIQUE(salon_id, date)
);

-- 8. MARKETING & LOYALTY
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    message_template TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaign_targets (
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    PRIMARY KEY (campaign_id, client_id)
);

CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earn', 'redeem')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ADMIN, BILLING & LOGS
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_ebooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. INDEXES (Performance)
CREATE INDEX IF NOT EXISTS idx_services_salon ON public.services(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_salon ON public.staff(salon_id);
CREATE INDEX IF NOT EXISTS idx_clients_salon ON public.clients(salon_id);
CREATE INDEX IF NOT EXISTS idx_bookings_salon ON public.bookings(salon_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(appointment_time);
CREATE INDEX IF NOT EXISTS idx_messages_salon ON public.messages(salon_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_salon ON public.campaigns(salon_id);
CREATE INDEX IF NOT EXISTS idx_invoices_salon ON public.invoices(salon_id);
CREATE INDEX IF NOT EXISTS idx_queue_status_time ON public.message_queue(status, scheduled_for);

-- 11. SECURITY (RLS)
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_ebooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can do everything" ON public.salons;
CREATE POLICY "Super admins can do everything" ON public.salons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

DROP POLICY IF EXISTS "Staff can view own salon data" ON public.services;
CREATE POLICY "Staff can view own salon data" ON public.services FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND salon_id = services.salon_id)
);

DROP POLICY IF EXISTS "Salon users can manage bookings" ON public.bookings;
CREATE POLICY "Salon users can manage bookings" ON public.bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND salon_id = bookings.salon_id)
);

DROP POLICY IF EXISTS "Salon users can view own activity logs" ON public.activity_logs;
CREATE POLICY "Salon users can view own activity logs" ON public.activity_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND salon_id = activity_logs.salon_id)
);

DROP POLICY IF EXISTS "Allow public read access to ebooks" ON public.crm_ebooks;
CREATE POLICY "Allow public read access to ebooks" ON public.crm_ebooks FOR SELECT USING (true);

-- 12. AUTOMATION (Triggers & Cron)
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- CRON Job
SELECT cron.schedule('marketing-queue-worker', '*/9 * * * *', $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/whatsapp-queue-worker',
    headers := '{"Content-Type": "application/json"}'::jsonb
  )
$$);


-- 14. REAL-TIME
ALTER publication supabase_realtime ADD TABLE public.messages;
ALTER publication supabase_realtime ADD TABLE public.activity_logs;

-- Salon business hours for each day
CREATE TABLE IF NOT EXISTS public.business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    is_working BOOLEAN DEFAULT TRUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    UNIQUE(salon_id, day_of_week)
);
CREATE TABLE IF NOT EXISTS public.loyalty_settings (
    salon_id UUID PRIMARY KEY REFERENCES public.salons(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT TRUE,
    points_per_visit INTEGER DEFAULT 10,
    points_per_spend NUMERIC(5,2) DEFAULT 1,
    points_to_redeem INTEGER DEFAULT 100,
    redeem_value NUMERIC(10,2) DEFAULT 50
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Salon users can manage clients" ON public.clients;
CREATE POLICY "Salon users can manage clients" ON public.clients FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND salon_id = clients.salon_id)
);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

CREATE TABLE IF NOT EXISTS public.marketing_settings (
  salon_id UUID PRIMARY KEY REFERENCES public.salons(id) ON DELETE CASCADE,
  threshold_regular INTEGER DEFAULT 1000,
  threshold_premium INTEGER DEFAULT 3000,
  threshold_vip INTEGER DEFAULT 5000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Function to update client stats when booking is completed
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE public.clients
        SET 
            total_spent = total_spent + NEW.final_price,
            total_visits = total_visits + 1,
            last_visit = NOW()
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_client_stats_on_booking
    AFTER UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_client_stats();
    -- Function to reset daily message limits (call via cron at midnight)
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS void AS $$
BEGIN
    INSERT INTO public.daily_message_limits (salon_id, date)
    SELECT id, CURRENT_DATE FROM public.salons
    ON CONFLICT (salon_id, date) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
-- Rename sort_order to order_index to match your frontend code
-- Create the missing FAQs table with the correct column name
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_ar TEXT,
    question_fr TEXT,
    answer TEXT NOT NULL,
    answer_ar TEXT,
    answer_fr TEXT,
    order_index INTEGER DEFAULT 0, -- Matches your frontend query
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_salon ON public.faqs(salon_id);

-- Enable security so the app can read them
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to faqs" ON public.faqs;
CREATE POLICY "Allow public read access to faqs" ON public.faqs FOR SELECT USING (true);



-- Create function to increment daily limits
CREATE OR REPLACE FUNCTION increment_daily_limit(
  p_salon_id UUID,
  p_date DATE,
  p_type TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
  UPDATE public.daily_message_limits
  SET 
    used_confirmation = CASE 
      WHEN p_type = 'confirmation' THEN used_confirmation + p_amount 
      ELSE used_confirmation 
    END,
    used_reminder = CASE 
      WHEN p_type = 'reminder' THEN used_reminder + p_amount 
      ELSE used_reminder 
    END,
    used_promotion = CASE 
      WHEN p_type = 'promotion' THEN used_promotion + p_amount 
      ELSE used_promotion 
    END,
    used_custom = CASE 
      WHEN p_type = 'custom' THEN used_custom + p_amount 
      ELSE used_custom 
    END
  WHERE salon_id = p_salon_id AND date = p_date;
  
  -- If no rows updated, insert new row
  IF NOT FOUND THEN
    INSERT INTO public.daily_message_limits (
      salon_id, 
      date, 
      used_confirmation, 
      used_reminder, 
      used_promotion, 
      used_custom
    ) VALUES (
      p_salon_id,
      p_date,
      CASE WHEN p_type = 'confirmation' THEN p_amount ELSE 0 END,
      CASE WHEN p_type = 'reminder' THEN p_amount ELSE 0 END,
      CASE WHEN p_type = 'promotion' THEN p_amount ELSE 0 END,
      CASE WHEN p_type = 'custom' THEN p_amount ELSE 0 END
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Gift Cards (optional - only if you need gift card functionality)
CREATE TABLE IF NOT EXISTS public.gift_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    value NUMERIC(10,2) NOT NULL,
    balance NUMERIC(10,2) NOT NULL,
    purchaser_name TEXT,
    purchaser_email TEXT,
    recipient_name TEXT,
    recipient_email TEXT,
    expiry_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for gift_cards
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salon users can manage gift cards" ON public.gift_cards;
CREATE POLICY "Salon users can manage gift cards" ON public.gift_cards FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND salon_id = gift_cards.salon_id)
);

-- Add the missing limit columns to marketing_settings
ALTER TABLE public.marketing_settings 
ADD COLUMN IF NOT EXISTS confirmation_limit INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS reminder_limit INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS promotion_limit INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS custom_limit INTEGER DEFAULT 30;

-- Insert or update marketing_settings for the UUID salon
INSERT INTO public.marketing_settings (salon_id, confirmation_limit, reminder_limit, promotion_limit, custom_limit)
VALUES ('00000000-0000-0000-0000-000000000001', 50, 50, 50, 50)
ON CONFLICT (salon_id) DO UPDATE 
SET confirmation_limit = 50,
    reminder_limit = 50,
    promotion_limit = 50,
    custom_limit = 50,
    updated_at = NOW();

-- Insert loyalty_settings for the UUID salon
INSERT INTO public.loyalty_settings (salon_id, enabled, points_per_visit, points_per_spend, points_to_redeem, redeem_value)
VALUES ('00000000-0000-0000-0000-000000000001', TRUE, 10, 1, 100, 50)
ON CONFLICT (salon_id) DO NOTHING;

-- Add used_custom column if not exists and update
ALTER TABLE public.daily_message_limits 
ADD COLUMN IF NOT EXISTS used_custom INTEGER DEFAULT 0;

INSERT INTO public.daily_message_limits (salon_id, date, used_confirmation, used_reminder, used_promotion, used_custom)
VALUES ('00000000-0000-0000-0000-000000000001', CURRENT_DATE, 0, 0, 0, 0)
ON CONFLICT (salon_id, date) DO UPDATE 
SET used_confirmation = 0,
    used_reminder = 0,
    used_promotion = 0,
    used_custom = 0;


    -- 1. Add paid_at to invoices table (referenced in useStore.ts line 102)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- 2. Create the audit_logs table (referenced in useStore.ts line 140)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS for Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Multi-Tenant Policy for Logs
CREATE POLICY "Super admins see all logs" ON public.audit_logs 
FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Salons see own logs" ON public.audit_logs 
FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND salon_id = audit_logs.salon_id));


-- 1. Marketing Settings (Required for Marketing Dashboard)
CREATE TABLE IF NOT EXISTS public.marketing_settings (
    salon_id UUID PRIMARY KEY REFERENCES public.salons(id) ON DELETE CASCADE,
    threshold_regular INTEGER DEFAULT 1000,
    threshold_premium INTEGER DEFAULT 3000,
    threshold_vip INTEGER DEFAULT 5000,
    confirmation_limit INTEGER DEFAULT 50,
    reminder_limit INTEGER DEFAULT 50,
    promotion_limit INTEGER DEFAULT 50,
    custom_limit INTEGER DEFAULT 50,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Campaigns Table (Required for Marketing Dashboard)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
    target_clients JSONB DEFAULT '[]',
    messages_sent INTEGER DEFAULT 0,
    messages_delivered INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Saved Filters Table (Required for useMarketingStore.ts)
CREATE TABLE IF NOT EXISTS public.saved_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    client_type TEXT,
    safe_only BOOLEAN DEFAULT FALSE,
    date_range TEXT DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS for all
ALTER TABLE public.marketing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

-- 5. Add Policies
CREATE POLICY "Salons manage own campaigns" ON public.campaigns FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND salon_id = campaigns.salon_id)
);
CREATE POLICY "Salons manage own filters" ON public.saved_filters FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND salon_id = saved_filters.salon_id)
);


-- 1. Ensure the Test Salon exists first
INSERT INTO public.salons (id, name, email, phone, currency, package, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Master Test Salon', 'admin@test.com', '923000000000', 'USD', 'pro', 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. Add Clients (client_type is calculated by the app, not stored in DB)
INSERT INTO public.clients (salon_id, name, email, phone, total_spent, total_visits, opt_in)
VALUES 
('00000000-0000-0000-0000-000000000001', 'John Doe', 'john@test.com', '923111111111', 1500.00, 5, true),
('00000000-0000-0000-0000-000000000001', 'Jane Smith', 'jane@test.com', '923222222222', 6000.00, 12, true),
('00000000-0000-0000-0000-000000000001', 'Ahmed Ali', 'ahmed@test.com', '923333333333', 200.00, 1, true);

-- 3. Add Settings to avoid the "Opening doors" loading screen
INSERT INTO public.marketing_settings (salon_id, threshold_regular, threshold_premium, threshold_vip)
VALUES ('00000000-0000-0000-0000-000000000001', 1000, 3000, 5000)
ON CONFLICT (salon_id) DO NOTHING;

INSERT INTO public.loyalty_settings (salon_id, enabled)
VALUES ('00000000-0000-0000-0000-000000000001', true)
ON CONFLICT (salon_id) DO NOTHING;

-- Final optimized version
INSERT INTO public.daily_message_limits (salon_id, date, used_confirmation, used_reminder, used_promotion, used_custom)
SELECT 
  s.id,
  (NOW() AT TIME ZONE COALESCE(s.timezone, 'UTC'))::DATE,
  5, 2, 0, 1
FROM public.salons s
WHERE s.id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT (salon_id, date) DO UPDATE 
SET used_confirmation = EXCLUDED.used_confirmation,
    used_reminder = EXCLUDED.used_reminder,
    used_promotion = EXCLUDED.used_promotion,
    used_custom = EXCLUDED.used_custom;

-- 1. Disable RLS for the salons table so your app can work immediately
ALTER TABLE public.salons DISABLE ROW LEVEL SECURITY;

-- 2. Manually insert the Demo Salon so it definitely exists
INSERT INTO public.salons (id, name, email, phone, currency, package, status, timezone)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Growva HQ',
  'admin@growva.com',
  '+9665000000',
  'SAR',
  'pro',
  'active',
  'Asia/Riyadh'
) ON CONFLICT (id) DO NOTHING;

-- 3. Verify it's there
SELECT * FROM public.salons WHERE id = '00000000-0000-0000-0000-000000000001';
-- 1. Allow the app to add new salons
CREATE POLICY "Allow authenticated inserts" ON public.salons
FOR INSERT WITH CHECK (true);

-- 2. Allow the app to initialize message limits
CREATE POLICY "Allow limit initialization" ON public.daily_message_limits
FOR INSERT WITH CHECK (true);

-- 3. Allow marketing settings setup
CREATE POLICY "Allow marketing settings setup" ON public.marketing_settings
FOR INSERT WITH CHECK (true);
-- 1. Create Staff table with Working Hours
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'stylist',
    working_hours JSONB, -- Stores the weekly schedule
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Create Services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    category_id UUID
);

-- 3. Create Gift Cards table
CREATE TABLE IF NOT EXISTS public.gift_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    balance NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- If you don't have a status column in your salons table, add it:
ALTER TABLE salons ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Update existing rows to have a default status
UPDATE salons SET status = 'active' WHERE status IS NULL;

ALTER FUNCTION public.increment_daily_limit SET search_path = public;
ALTER FUNCTION public.reset_daily_limits SET search_path = public;
ALTER FUNCTION public.update_updated_at SET search_path = public;

-- Check if salon_id is indexed in bookings table
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'bookings'
  AND indexdef LIKE '%salon_id%';

-- If not, create indexes:
CREATE INDEX IF NOT EXISTS idx_bookings_salon_id ON bookings(salon_id);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_time ON bookings(appointment_time);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);