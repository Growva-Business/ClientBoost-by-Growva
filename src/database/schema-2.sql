-- ============================================
-- SALON CRM - CLEAN CONSOLIDATED SCHEMA
-- ============================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. CORE TABLES
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

-- 3. SERVICE CATALOG
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

-- 4. STAFF
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
    working_hours JSONB,
    role TEXT DEFAULT 'stylist',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff_services (
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    PRIMARY KEY (staff_id, service_id)
);

-- 5. CLIENTS
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

-- 7. MESSAGING
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
    used_custom INTEGER DEFAULT 0,
    UNIQUE(salon_id, date)
);
-- In the INDEXES section:
CREATE INDEX IF NOT EXISTS idx_queue_status_time ON public.message_queue(status, scheduled_for);
-- For real-time updates:
ALTER publication supabase_realtime ADD TABLE public.message_queue;
-- 8. MARKETING & LOYALTY
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

CREATE TABLE IF NOT EXISTS public.loyalty_settings (
    salon_id UUID PRIMARY KEY REFERENCES public.salons(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT TRUE,
    points_per_visit INTEGER DEFAULT 10,
    points_per_spend NUMERIC(5,2) DEFAULT 1,
    points_to_redeem INTEGER DEFAULT 100,
    redeem_value NUMERIC(10,2) DEFAULT 50
);

CREATE TABLE IF NOT EXISTS public.saved_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    client_type TEXT,
    safe_only BOOLEAN DEFAULT FALSE,
    date_range TEXT DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ADMIN & BILLING
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    category TEXT,
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

-- 10. CONTENT & FAQ
CREATE TABLE IF NOT EXISTS public.crm_ebooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_ar TEXT,
    question_fr TEXT,
    answer TEXT NOT NULL,
    answer_ar TEXT,
    answer_fr TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. GIFT CARDS
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

-- 12. BUSINESS HOURS
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

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN 
    NEW.updated_at = NOW(); 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Client stats update
CREATE OR REPLACE FUNCTION update_client_stats() RETURNS TRIGGER AS $$
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

-- Reset daily limits
CREATE OR REPLACE FUNCTION reset_daily_limits() RETURNS void AS $$
BEGIN
    INSERT INTO public.daily_message_limits (salon_id, date)
    SELECT id, CURRENT_DATE FROM public.salons
    ON CONFLICT (salon_id, date) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Increment daily limits
CREATE OR REPLACE FUNCTION increment_daily_limit(
  p_salon_id UUID,
  p_date DATE,
  p_type TEXT,
  p_amount INTEGER DEFAULT 1
) RETURNS void AS $$
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
  
  IF NOT FOUND THEN
    INSERT INTO public.daily_message_limits (
      salon_id, date, used_confirmation, used_reminder, used_promotion, used_custom
    ) VALUES (
      p_salon_id, p_date,
      CASE WHEN p_type = 'confirmation' THEN p_amount ELSE 0 END,
      CASE WHEN p_type = 'reminder' THEN p_amount ELSE 0 END,
      CASE WHEN p_type = 'promotion' THEN p_amount ELSE 0 END,
      CASE WHEN p_type = 'custom' THEN p_amount ELSE 0 END
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_client_stats_on_booking AFTER UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_client_stats();

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_services_salon ON public.services(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_salon ON public.staff(salon_id);
CREATE INDEX IF NOT EXISTS idx_clients_salon ON public.clients(salon_id);
CREATE INDEX IF NOT EXISTS idx_bookings_salon ON public.bookings(salon_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(appointment_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_salon ON public.messages(salon_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_salon ON public.campaigns(salon_id);
CREATE INDEX IF NOT EXISTS idx_invoices_salon ON public.invoices(salon_id);
CREATE INDEX IF NOT EXISTS idx_faqs_salon ON public.faqs(salon_id);
CREATE INDEX IF NOT EXISTS idx_queue_status_time ON public.message_queue(status, scheduled_for);

-- ============================================
-- INITIAL DATA
-- ============================================

-- Demo Salon
INSERT INTO public.salons (id, name, email, phone, currency, package, status, timezone)
VALUES ('00000000-0000-0000-0000-000000000001', 'Growva HQ Demo', 'admin@growva.com', '+9665000000', 'SAR', 'pro', 'active', 'Asia/Riyadh')
ON CONFLICT (id) DO NOTHING;

-- Sample Clients
INSERT INTO public.clients (salon_id, name, email, phone, total_spent, total_visits, opt_in)
VALUES 
('00000000-0000-0000-0000-000000000001', 'John Doe', 'john@test.com', '923111111111', 1500.00, 5, true),
('00000000-0000-0000-0000-000000000001', 'Jane Smith', 'jane@test.com', '923222222222', 6000.00, 12, true)
ON CONFLICT DO NOTHING;

-- Settings
INSERT INTO public.marketing_settings (salon_id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (salon_id) DO NOTHING;

INSERT INTO public.loyalty_settings (salon_id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (salon_id) DO NOTHING;

INSERT INTO public.daily_message_limits (salon_id, date)
VALUES ('00000000-0000-0000-0000-000000000001', CURRENT_DATE)
ON CONFLICT (salon_id, date) DO NOTHING;

-- ============================================
-- ESSENTIAL SCHEMA UPDATES (Run these ONLY)
-- ============================================

-- 1. Add missing columns to existing tables
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_auto_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id); -- In case missing

ALTER TABLE message_queue
ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_reason TEXT,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS recipient_phone TEXT; -- If missing

-- 2. Create simple daily limits table (if not exists)
CREATE TABLE IF NOT EXISTS daily_message_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES salons(id),
  date DATE NOT NULL,
  used_promotion INTEGER DEFAULT 0,    -- Marketing messages
  used_confirmation INTEGER DEFAULT 0, -- Booking confirmations
  used_reminder INTEGER DEFAULT 0,     -- Reminders
  used_custom INTEGER DEFAULT 0,       -- Staff alerts & custom
  UNIQUE(salon_id, date)
);

-- 3. Create message_queue table (if not exists)
CREATE TABLE IF NOT EXISTS message_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES salons(id),
  recipient_phone TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('confirmation', 'reminder', 'promotion', 'custom')),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'failed')),
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  attempt_count INTEGER DEFAULT 0,
  error_reason TEXT,
  priority INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

UPDATE daily_message_limits
SET used_promotion = used_promotion + 1
WHERE salon_id = $1 AND date = CURRENT_DATE;
UPDATE daily_message_limits
SET used_confirmation = used_confirmation + 1
WHERE salon_id = $1 AND date = CURRENT_DATE;
