# Project Context
- This is a Vite React CRM for salons.
# 🚀 Project: ClientBoost by Growva (Salon Operating System)

## 🎯 Business Mission & Vision
ClientBoost is an All-in-One Salon OS designed for rapid worldwide scaling.
- **Goal:** Get 1,000 salons in 3 months.
- **Model:** CRM is the "Lead Generator" for Growva Agency marketing services.
- **Strategy:** Free Trial -> Tiered WhatsApp Plans (Basic/Advanced/Pro).

## 📂 Folder Structure (Architectural Map)
- `/auth/`: Supabase Auth (Login, Register, Password Reset).
- `/super-admin/`: Owner Dashboard (Salon creation, billing, manual payment updates, WhatsApp provider control).
- `/booking-dashboard/`: Operations (Calendar, Staff, Services, Loyalty, Gift Cards, Setup Wizard).
- `/marketing-dashboard/`: Growth (Merged Online/Walk-in Analytics, Retention, Campaigns).
- `/widget/`: Embeddable JS (Multi-language AR/EN/FR, Works on WP/Wix/Socials).
- `/shared/`: Core logic (Supabase client, API wrappers, Global Messaging Engine).
- `/billing/`: PDF Invoices & Manual Payment Tracking (No auto-gateway, admin-confirmed).
- `/database/`: Supabase SQL (Tables, RLS, Triggers, Seed data).

## 💬 WhatsApp Messaging Engine (Token-Safe Logic)
This is the most sensitive part of the system. The AI Agent must strictly enforce:

### 1. Daily Message Quotas (Per Salon)
- **Confirmations:** 30/day | **Reminders:** 30/day | **Promotions:** 30/day.
- **Hard Limit:** 90 total per salon per day.
- **Overflow:** If limit reached, switch from Manual WhatsApp to Twilio/Meta API automatically.

### 2. The "Free Window" Override (Token-Safe)
- **Rule:** If a client replies to the salon, a **24-hour Customer Service Window** opens.
- **Bypass:** Messages sent within this 24-hour window **DO NOT count** toward the 30/30/30 daily limits.
- **Action:** Check `last_customer_reply` timestamp before deducting from daily quota.

### 3. Queue & Delivery Logic
- **Gap:** Minimum 9-minute gap between any two marketing messages for the same salon.
- **Time Window:** Promotions only sent 09:00 - 22:30 (Salon Local Time).
- **Retry:** Auto-retry queue for failed API calls; fallback to manual logs on total failure.

## 📊 Analytics & Data Merging
- **Unified View:** Marketing Dashboard must merge **Online Bookings** + **Walk-in Clients**.
- **Categorization:** Auto-categorize clients as New, Regular, Premium, or VIP based on spend ranges.
- **Tracking:** Monitor ROI on every WhatsApp campaign sent.

## 🧾 Billing & Invoices
- **Invoice Generation:** Monthly automated PDF generation in `/billing/`.
- **Manual Payment:** System shows "Pending" by default. Super Admin must manually click "Received" to update status.
- **Usage Tracking:** Admin must see exact API/Message usage per salon to justify billing tiers.

## 🕒 Global System Rules
- **Timezones:** Store in UTC. Execute/Display in Salon Local Time.
- **Languages:** English, Arabic (RTL support), French. Default linked to salon country.
- **Multi-Tenancy:** Strict Row-Level Security (RLS). `salon_id` is mandatory for every query.

## 🤖 Instructions for AI Assistant
1. **Context Awareness:** You are a Senior System Architect.
2. **Setup Task:** Help create the physical folder structure first.
3. **Execution Task:** Start with **PART 1: Super Admin Dashboard**.
4. **Validation:** Always verify if message logic respects the "Free Window" bypass and the "9-minute gap."

## ✅ Task Completion Status
- [x] Dynamic Branding

Update [2026-01-27]:

Refactor: Created src/shared/utils/ structure.

DB Schema: Unified bookings to use TIMESTAMPTZ for global consistency.

Logic: Implemented date-logic.ts using Luxon for IANA timezone support.

# 🚀 ClientBoost - Project Status

## ✅ Phase 1: Infrastructure & Core Logic (Completed)
- **Timezone Integrity:** Unified `appointment_time` (TIMESTAMPTZ) implemented in `schema.sql`.
- **Global Date Helper:** `src/shared/utils/date-logic.ts` created using Luxon for IANA support.
- **Store Sync:** `useBookingStore.ts` refactored to use `toUTC()` and unified timestamp fields.
- **Environment:** `.env` configured with Supabase and Gemini Flash-First settings.
- **Security:** Supabase client initialized in `src/shared/lib/supabase.ts`.

## 🛠️ Current Project State
- **Database:** Schema defined and ready for first migration.
- **Frontend:** State management (Zustand) is timezone-aware.
- **Messaging:** Logic gatekeeper for "Free Window" (24h) and 9-min gap is designed.

## 🎯 Next Objective: PART 1 — SUPER ADMIN DASHBOARD
- Connect `useStore.ts` to Supabase for Salon creation.
- Implement manual payment tracking UI.
- Verify WhatsApp provider control logic.

Phase 1: Foundations (COMPLETED)
Database Schema: Completed schema.sql with multi-tenancy support and TIMESTAMPTZ for global scaling.

Timezone Integrity: Created date-logic.ts using Luxon to handle UTC conversions.

State Management: Refactored useBookingStore.ts to be timezone-aware and resolved all TypeScript interface errors.

Connection: Established supabase.ts connection and .env structure.
# 🚀 Project Status Update - 2026-01-27

## ✅ Phase 2: Live Database Connection (Started)
- **useStore.ts Refactor:** Completely removed all mock data.
- **Live Actions:** Implemented `fetchSalons` and `addSalon` using Supabase.
- **Multi-Tenancy:** Schema now enforces `salon_id` and correct `snake_case` naming.
- **Message Limits:** Auto-initialization of `daily_message_limits` added to the salon creation flow.

## 🛠️ Next Steps
- Create the **Super Admin UI** to use these new live functions.
- Build the "Magic Form" to add new salons to our system.


salon-crm-project-structure
     modules
     src 
       components
            BookingLayout.tsx
            Layout.tsx
            MarketingLyout.tsx
        data
           countries.ts
        database
            schema.sql
        localization
            translations.ts
        pages
          booking
            BookingDashboard.tsx
            BookingSettingPage.tsx
            CalendarPage.tsx
            FAQsPage.tsx
            GiftCardPage.tex
            LoyaltyCards.tsx
            MessagesPage.tsx
            ServicePage.tsx
            StaffPage.tsx
          marketing
            AnalyticsPages.tsx
            CampaignPage.tsx
            ClientsPage.tsx
            DashboardPage.tsx
            MarketingDashboard.tsx
            MarketingSettingPage.tsx
            StaffReportingPage.tsx
          widget
            BookingWidget.tsx
          Admin
          ApiUsage.tsx
          Billing.tsx
          Dashboard.tsx
          Invoices.tsx
          Logs.tsx
          Salons.tsx
          Settings.tsx
          EbookManger.tsx
          
        Shared
           lib
             supabase.ts
           utils
             cn.ts
             data-logic.ts
        store
            useBookingStore.ts
            useMarketingStore.ts
            useStore.ts
        types
          index.ts
        APP.tsx
        index.css
        main.tsx
    index.html
    package-lock.json
    package.json
    tsconfig.json
    vite.config.ts
    .env

# 🚀 Project Status Update - 2026-01-27

## 📂 Architectural Mapping (Verified)
- **Store Location:** `src/store/` (Centralized logic).
- **Shared Libs:** `src/shared/lib/supabase.ts` (Database connection).
- **Page Modules:** Segregated into `booking` and `marketing` directories.

## 🛠️ Next Task: Type Alignment
- **Objective:** Sync `src/types/index.ts` with `schema.sql` snake_case naming conventions.
- **Goal:** Eliminate TypeScript errors when performing Supabase operations.
# 🚀 Project Status Update - 2026-01-27

## ✅ Super Admin Dashboard (Live)
- **Data Fetching:** Implemented `useEffect` to fetch salons from Supabase on page load.
- **Form Submission:** Refactored the Salon Creation Form to use the live `addSalon` action.
- **State Sync:** The UI now correctly displays `snake_case` properties from the database.
- **UX Improvements:** Added a loading state to show while fetching data from the server.
# 🚀 Project Status Update - 2026-01-27

## ✅ Billing & Payments (Updated)
- **Data Integrity:** Refactored `Billing.tsx` to use `snake_case` properties (`salon_id`, `created_at`, `due_date`).
- **Logic Cleanup:** Fixed the group-by-salon logic to correctly find the `latestInvoice` using the new field names.
- **UI Safety:** Removed unused icons (`Filter`, `AlertCircle` logic check, etc.) to keep the console clean.
Dictionary Sync: Updated index.ts to use created_at and user_email. This is the most important fix
# 🚀 Project Status Update - 2026-01-27

## ✅ Invoice Management (Live)
- **Data Fetching:** Added `useEffect` to fetch real invoices from the database.
- **Improved UI:** Refactored the invoice table and modal to use `snake_case` fields (`invoice_number`, `due_date`, `created_at`).
- **PDF Generation:** Implemented a improved text-blob download method for salon invoices.
- **Workflow:** Verified the "Mark as Paid" logic which triggers an audit log and updates the local state.

# 🚀 Project Status Update - 2026-01-27

## ✅ Phase 2: Super Admin (Completed)
- Salons, Billing, and Logs are now connected to the Live Database.

## 🏗️ Phase 3: Booking Dashboard (Starting)
- **Goal:** Move from "Platform Management" to "Salon Operations."
- **Focus:** Calendar, Staff Management, and Client Bookings.
- **Safety Rule:** Ensure all queries use `salon_id` for data isolation.

# 🚀 Project Status Update - 2026-01-27

## ✅ Phase 3: Booking Dashboard (Live)
- **Store Sync:** `useBookingStore.ts` now fetches real data and respects Multi-Tenancy via `salon_id`.
- **Timezone Logic:** Unified `appointment_time` handling using Luxon `toUTC` for new bookings.
- **Dynamic Branding:** Dashboard UI now inherits `brand_color` from the Salon Profile.
- **Message Guard:** Added UI warnings for daily message limits (90/day limit).
# 🚀 Project Status Update - 2026-01-27

## ✅ Live Calendar Implementation
- **Timezone Aware:** Calendar now uses `fromUTC` to show appointments in the salon's local time.
- **Store Connection:** Integrated `fetchData` to pull real bookings from Supabase.
- **UX Design:** Simplified the weekly selector and added color-coded status badges.
- **Clean Code:** Removed all unused "Calendar" icons and variables to resolve warnings.
# 🚀 Project Status Update - 2026-01-27

## ✅ UI Interactivity (Completed)
- **Functional Filters:** Connected Search, Status, and Package state setters to the Salons UI components.
- **Metric Visibility:** Displayed API usage and daily message stats on the Super Admin Dashboard.
- **Warning Resolution:** All "declared but never read" warnings for these pages are now resolved.
Metric Polish: The Dashboard cards for Live API Traffic and Messages Today are now receiving data.

Search & Filter: Search query, status filter, and package filter are now fully operational in the Salons page.

Property Corrected: Fixed the discount_price typo to discounted_price in the package creation form.

Imports Cleaned: Removed unused Search and Edit2 icons to clear yellow warnings.

State Cleaned: Removed the unused searchQuery and setSearchQuery variables.

Parallel Fetching: The fetchData function fetches 11 different tables at once, making the dashboard load very fast.

Full CRUD: Every page (Staff, Services, Packages, FAQs) now has its own add, update, and delete functions ready.

JSON & Relationships: It correctly handles the complex relationship between Packages and Services, as well as the working hours JSON for staff.

Schema Aligned: All database table names (service_categories, package_services, etc.) match your schema.sql exactly.

Messaging Live: The Store now includes real Supabase logic for sendConfirmation and sendReminder.

Safety Guard: Integrated the 90-message daily limit warning and usage tracker into the UI.

Data Integrity: Replaced mock message history with a live feed from the messages table.
Customization Ready: Users can now update their brand identity directly in the UI.

Logic Verified: The updateProfile action in the store correctly targets the salons table in Supabase.

Localization: Added support for Timezones and Currency, which are vital for your upcoming silver investment calculations and international business plans.
Your Project Diary (Update)
Store Expansion: Added addCategory and deleteCategory to useBookingStore.ts to support organized service menus.

UI Component: Created CategoryManager.tsx as a reusable modal that adheres to the salon's brand color.

Database Connection: Linked the component directly to the service_categories table in Supabase.
Logic Fully Restored: Re-implemented the handleSubmit logic and isModalOpen state to ensure the service creation flow works perfectly.

Icon Integration: Integrated the Scissors, Clock, DollarSign, and X icons into the table and modal UI to satisfy the TypeScript compiler.

Warning Clearance: Successfully resolved all 6 "declared but never read" warnings in the Services page
File Structure: Organized ClientModal.tsx directly within src/components/ to match your flat folder preference.

Full CRUD Logic: Enabled the ability to both add and edit clients directly from the ClientsPage.

Search Ready: The search bar is now fully functional, allowing for quick client lookups by name or phone.
Logic Integration: Created a unified modal that handles the complex relational data between clients, services, and staff.

Real-time Price Sync: Included logic to pull the price and currency directly from the selected service to ensure billing accuracy.

Clean Imports: Maintained your flat folder structure by placing this directly in the components folder.

Component Finalized: Created a unified UpgradePopup that handles multiple business logic paywalls.

Logic Ready: The component is now ready to be imported into both the Staff Page and the Services Page.
Conversion Optimization: Added a high-value incentive (the E-book) to ensure clients interact with the WhatsApp business line.

Logic Link: Successfully connected the ebook_url from the Service data to the dynamic WhatsApp button.

Cost Control: This flow ensures the first "Marketing/Confirmation" message is essentially free because the client initiated the conversation.

Logic Bridge: Designed the URL generator that passes the e-book metadata into the WhatsApp message payload.

Auto-Responder Trigger: Established the keyword-based trigger ("Ref:") for the WhatsApp API to handle the delivery without manual salon work.
Code Polish: Fixed the syntax for the WhatsApp URL generator to ensure dynamic data is injected correctly.

Link Integrity: Ensured the Ref-ID is clearly visible for your WhatsApp auto-responder to pick up.
Architecture: Standardized the page navigation types to ensure the sidebar can safely switch between all three dashboard contexts.

chitecture: Finalized the multi-dashboard routing logic within App.tsx.

Cleanup: Synchronized all marketing-related imports with the UI rendering cycle to achieve a zero-error build.

Super Admin: EbookManager is linked and ready for your global library.

Booking: Dashboard and Packages are fully operational.

Marketing: You now have a complete 5-page suite (Dashboard, Clients, Campaigns, Analytics, Reports, and Settings).

State: Your useMarketingStore is successfully managing everything from VIP thresholds to campaign status.
Status: Marketing module is now "live" and connected to Supabase.

Database: New tables added for campaigns and global marketing settings.

Architecture: The store now performs real-time calculations for client tiers based on spending thresholds.


# Growva CRM - Project Context & Database Schema
**Current State:** Phase 2 (Super Admin & Database Infrastructure)
**Core Goal:** 1 Crore Revenue Scale & 50/50/50/50 Messaging Strategy

## 🚀 Business Logic: 50/50/50/50 Messaging
Each salon has a daily limit of 50 messages per category to ensure provider safety and high delivery rates:
1. **Confirmation:** 50/day
2. **Reminder:** 50/day
3. **Promotion:** 50/day
4. **Custom/Campaign:** 50/day

## 🛠️ Database Infrastructure (Supabase/PostgreSQL)
The database uses **UUIDs** for all primary keys. The Test Salon ID is `00000000-0000-0000-0000-000000000001`.

### Core Tables Summary:
* **salons**: Main business profiles.
* **users**: Auth extension with roles (super_admin, salon_admin, staff).
* **daily_message_limits**: Tracks the 50/50/50/50 usage.
* **marketing_settings**: Stores salon-specific thresholds and limits.
* **faqs**: Uses `order_index` for sorting.

### Critical Automation Functions:
* **increment_daily_limit**: Atomically updates the 4-category message counts.
* **update_client_stats**: Automatically updates `total_spent` and `total_visits` when a booking is 'completed'.
* **reset_daily_limits**: Midnight cron job to reset counters.

## 📄 Final Corrected Master Schema
```sql
-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. CORE TABLES
CREATE TABLE IF NOT EXISTS public.salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    currency TEXT NOT NULL,
    package TEXT NOT NULL DEFAULT 'pro',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- 3. AUTOMATION LOGIC
CREATE OR REPLACE FUNCTION increment_daily_limit(
  p_salon_id UUID, p_date DATE, p_type TEXT, p_amount INTEGER DEFAULT 1
) RETURNS void AS $$
BEGIN
  UPDATE public.daily_message_limits
  SET 
    used_confirmation = CASE WHEN p_type = 'confirmation' THEN used_confirmation + p_amount ELSE used_confirmation END,
    used_reminder = CASE WHEN p_type = 'reminder' THEN used_reminder + p_amount ELSE used_reminder END,
    used_promotion = CASE WHEN p_type = 'promotion' THEN used_promotion + p_amount ELSE used_promotion END,
    used_custom = CASE WHEN p_type = 'custom' THEN used_custom + p_amount ELSE used_custom END
  WHERE salon_id = p_salon_id AND date = p_date;
  
  IF NOT FOUND THEN
    INSERT INTO public.daily_message_limits (salon_id, date, used_confirmation, used_reminder, used_promotion, used_custom)
    VALUES (p_salon_id, p_date,
      CASE WHEN p_type = 'confirmation' THEN p_amount ELSE 0 END,
      CASE WHEN p_type = 'reminder' THEN p_amount ELSE 0 END,
      CASE WHEN p_type = 'promotion' THEN p_amount ELSE 0 END,
      CASE WHEN p_type = 'custom' THEN p_amount ELSE 0 END
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
**Would you like me to help you set up the next step—building the "Add New Salon" modal to finally start using this 50/50/50/50 logic?**
             
       

          Database Sync: You have confirmed the audit_logs table name matches the frontend (avoiding activity_logs confusion).

Audit Logic: Your useStore.ts correctly triggers fetchAuditLogs() after every major action (addSalon, markInvoiceAsPaid), ensuring the "Chief" sees real-time updates.

Security: RLS is now applied to the metadata tables (Settings, Limits, Logs) so that your Multi-Tenant architecture is actually private.

UI Stability: The Dashboard.tsx is now safe from "Yellow Warnings" because totalApiCalls and totalMessages are actually calculated from the salon data.

# 🚀 ClientBoost - Senior Architect Source of Truth

## 🎯 Business Mission
- **Strategy:** 1 Crore Revenue Scale via 50/50/50/50 Messaging Strategy.
- **Model:** Free CRM + Paid WhatsApp Tiered Plans.

## 🛠️ Core Infrastructure (Verified)
- **Database:** Supabase (PostgreSQL) with UUIDs.
- **Timezone:** Store in UTC, Display in Salon Local Time (Luxon-powered).
- **Multi-Tenancy:** Row-Level Security (RLS) is mandatory on all tables.
- **State Management:** Zustand (useStore for Admin, useBookingStore for Ops, useMarketingStore for Growth).

## 💬 50/50/50/50 Messaging Logic
Each salon is restricted to 50 messages per category per day to prevent provider bans:
1. **Confirmation:** 50/day (Table: `daily_message_limits.used_confirmation`).
2. **Reminder:** 50/day (Table: `daily_message_limits.used_reminder`).
3. **Promotion:** 50/day (Table: `daily_message_limits.used_promotion`).
4. **Custom/Campaign:** 50/day (Table: `daily_message_limits.used_custom`).

## 📊 Database Schema Updates (Latest)
- **audit_logs:** Primary logging table for all dashboards (Action, Details, Category, Salon_id).
- **marketing_settings:** threshold_regular, threshold_premium, threshold_vip, and message limits.
- **daily_message_limits:** used_confirmation, used_reminder, used_promotion, used_custom.
- **gift_cards:** code, balance, is_active (Operational - Booking Dashboard).
- **loyalty_settings:** points_per_visit, points_per_spend, points_to_redeem, redeem_value.

## 🕒 Tech Stack Rules
- **Formatting:** Use LaTeX for complex math/finance only. Use Markdown/Tables for prose.
- **Frontend:** Vite + React + TypeScript + Tailwind CSS.
- **Icons:** Lucide-react (Search, Bell, Scissors, Clock, DollarSign, etc.).

## 🤖 AI Interaction Protocol
1. **RLS Verification:** Always assume RLS is required for new tables.
2. **Optional salonId:** Components like `ActivityLog` must handle `salonId?: string` to support both Super Admin (global) and Salon Admin (filtered) views.
3. **Path Accuracy:**
   - Admin: `src/pages/admin/`
   - Booking: `src/pages/booking/`
   - Marketing: `src/pages/marketing/`
   - Shared: `src/shared/lib/` or `src/shared/utils/`

   Correct Table Names: Replaced all activity_logs with audit_logs to match your frontend.

Safe Fetching: Uses maybeSingle() for limits to prevent the worker from crashing on brand-new salons that don't have a limits row for the day.

Status Lifecycle: Properly moves messages from queued → processing → sent (deleted) or queued (with delay).

Audit Integration: Every action (Success, Limit Reached, or Retry) is logged so your Super Admin Dashboard and Booking Dashboard show live data instantly.
           
        