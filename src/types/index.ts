// ============================================
// 👑 CORE SYSTEM TYPES
// ============================================

export type UserRole = 'super_admin' | 'salon_admin' | 'staff';
export type Language = 'en' | 'ar' | 'fr';
export type PackageType = 'basic' | 'advanced' | 'pro';
export type WhatsAppProvider = 'manual' | 'twilio' | 'meta_cloud';
export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export type BillingStatus = 'active' | 'suspended' | 'cancelled';

export interface Country {
  code: string;
  name: string;
  name_ar: string;
  name_fr: string;
  phone_prefix: string;
  currency: string;
  currency_symbol: string;
}

export interface Salon {
  id: string;
  name: string;
  email: string;
  phone: string;
  country_code: string;
  currency: string;
  language: Language;
  package: PackageType;
  whatsapp_provider: WhatsAppProvider;
  status: BillingStatus;
  created_at: string;
  api_usage: APIUsage;
  message_stats: MessageStats;
}

export interface APIUsage {
  total_calls: number;
  daily_limit: number;
  used_today: number;
  last_reset: string;
}

export interface MessageStats {
  total_sent: number;
  today_sent: number;
  daily_limit: number;
  whatsapp_sent: number;
  sms_sent: number;
  email_sent: number;
}

export interface Invoice {
  id: string;
  salon_id: string;
  salon_name: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  due_date: string;
  created_at: string;
  paid_at?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface AuditLog {
  id: string;
  salon_id: string;    // Required for Multi-Tenancy isolation
  action: string;      // e.g., 'whatsapp_sent', 'payment_received'
  details: string;     // Specific info about the action
  category: 'auth' | 'salon' | 'billing' | 'settings' | 'api' | 'marketing' | 'warning'; 
  created_at: string;  // Database timestamp
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  salon_id?: string;
  created_at: string;
}

export interface DashboardStats {
  total_salons: number;
  active_salons: number;
  total_revenue: number;
  pending_payments: number;
  total_messages: number;
  total_api_calls: number;
}

export interface PackagePricing {
  type: PackageType;
  name: string;
  price: number;
  features: string[];
  message_limit: number;
  api_limit: number;
}

// ========== 📅 BOOKING DASHBOARD TYPES ==========

export type AgeGroup = 'under16' | '16-25' | '26-45' | '45-60' | '60+';

export interface ServiceCategory {
  id: string;
  name: string;
  name_ar: string;
  name_fr: string;
  type: 'hair' | 'skin' | 'nails' | 'other';
  description?: string;
  order: number;
  salon_id: string;
}

export interface Service {
  id: string;
  salon_id: string;
  category_id: string;
  name: string;
  name_ar: string;
  name_fr: string;
  description?: string;
  duration: number; 
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  ebook_url?: string;
}

export interface ServicePackage {
  id: string;
  salon_id: string;
  name: string;
  name_ar: string;
  name_fr: string;
  description?: string;
  services: string[]; 
  original_price: number;
  discounted_price: number;
  currency: string;
  valid_days: number;
  is_active: boolean;
  created_at: string;
}

export interface WorkingHours {
  day_of_week: number; 
  is_working: boolean;
  start_time: string; 
  end_time: string; 
  break_start?: string;
  break_end?: string;
}

export interface Staff {
  id: string;
  salon_id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  services: string[]; 
  working_hours: WorkingHours[];
  commission_percent: number;
  is_active: boolean;
  created_at: string;
  is_artist: boolean;
}

export interface SalonProfile {
  id: string;
  name: string;
  logo?: string;
  brand_color: string;
  address: string;
  phone: string;
  email: string;
  country_code: string;
  language: Language;
  currency: string;
  tax_percent: number; 
  timezone: string;
  business_hours: WorkingHours[];
  is_active: boolean;
  max_staff_limit: number; 
  plan_name: string;       
}

export interface FAQ {
  id: string;
  salon_id: string;
  question: string;
  question_ar: string;
  question_fr: string;
  answer: string;
  answer_ar: string;
  answer_fr: string;
  order: number;
  is_active: boolean;
}

export interface LoyaltySettings {
  enabled: boolean;
  points_per_visit: number;
  points_per_spend: number; 
  points_to_redeem: number; 
  redeem_value: number; 
}

export interface GiftCard {
  id: string;
  salon_id: string;
  code: string;
  value: number;
  currency: string;
  balance: number;
  purchaser_name?: string;
  purchaser_email?: string;
  recipient_name?: string;
  recipient_email?: string;
  expiry_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  salon_id: string;
  name: string;
  email: string;
  phone: string;
  age_group: AgeGroup;
  loyalty_points: number;
  total_spent: number;
  total_visits: number;
  last_visit?: string;
  notes?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Booking {
  id: string;
  salon_id: string;
  client_id: string;
  staff_id?: string;
  service_id: string;
  date: string;
  end_time: string;
  appointment_time: string; // UTC String
  duration_minutes: number; 
  total_price: number;
  tax_amount: number;
  final_price: number;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  client?: { 
    name: string;
    phone: string; // ✨ Added phone here so message history can display it
  }; 
  service?: { name: string };
  staff?: { name: string };
  start_time: string;
  clients?: {
    name: string;
    phone: string;
  };
  // ✨ Added these two to support WhatsApp tracking
  confirmation_sent?: boolean;
  reminder_sent?: boolean;    
}
export type MessageType = 'confirmation' | 'reminder' | 'promotion' | 'receipt' | 'custom' | 'staff_alert';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'queued';

export interface Message {
  id: string;
  salon_id: string;
  client_id: string;
  client_phone: string;
  type: MessageType;
  content: string;
  provider: WhatsAppProvider;
  status: MessageStatus;
  scheduled_at?: string;
  sent_at?: string;
  delivered_at?: string;
  failed_reason?: string;
  retry_count: number;
  created_at: string;
}

export interface DailyMessageLimits {
  total: number;
  confirmation: number;
  reminder: number;
  promotion: number;
  used_custom: number; 
  used_total: number;
  used_confirmation: number;
  used_reminder: number;
  used_promotion: number;
  last_reset: string;
}

export interface MessageQueue {
  id: string;
  salon_id: string;
  message: Omit<Message, 'id' | 'sent_at' | 'delivered_at'>;
  scheduled_at: string;
  priority: number; 
  status: 'queued' | 'processing' | 'sent' | 'failed';
}

export interface TimeSlot {
  time: string;
  available: boolean;
  staff_id?: string;
  staff_name?: string;
}

// ========== 📣 MARKETING DASHBOARD TYPES ==========

export type ClientType = 'new' | 'regular' | 'premium' | 'vip';
export type ClientSource = 'online' | 'walk_in';

export interface MarketingClient extends Client {
  client_type: ClientType;
  source: ClientSource;
  gender?: 'male' | 'female' | 'other';
  opt_in: boolean;
  last_message_at?: string;
  free_window_ends_at?: string;
}

export interface ClientTypeThresholds {
  regular: number; 
  premium: number; 
  vip: number; 
}

export interface SavedFilter {
  id: string;
  name: string;
  date_range: 'week' | 'month' | '3months' | '6months' | 'all';
  gender?: 'male' | 'female' | 'other';
  age_group?: AgeGroup;
  service_id?: string;
  package_id?: string;
  staff_id?: string;
  min_spend?: number;
  max_spend?: number;
  client_type?: ClientType;
  safe_only: boolean;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';

export interface Campaign {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  message_template: string;
  message_template_ar?: string;
  message_template_fr?: string;
  target_clients: string[]; 
  status: CampaignStatus;
  promotion_days: number; 
  follow_up_days: number; 
  auto_send: boolean;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  messages_sent: number;
  messages_delivered: number;
  messages_clicked: number;
  created_at: string;
}

export interface StaffCommission {
  staff_id: string;
  staff_name: string;
  total_bookings: number;
  total_revenue: number;
  commission_percent: number;
  commission_earned: number;
  period: string;
}

export interface MarketingAnalytics {
  total_active_clients: number;
  new_clients_this_month: number;
  avg_client_spend: number;
  avg_visit_frequency: number;
  client_growth: number; 
  retention_rate: number; 
  top_services: { service_id: string; service_name: string; count: number; revenue: number }[];
  top_staff: { staff_id: string; staff_name: string; bookings: number; revenue: number }[];
  revenue_by_month: { month: string; revenue: number }[];
  clients_by_type: { type: ClientType; count: number }[];
}

// ========== 🎨 WIDGET TYPES ==========

export interface WidgetSettings {
  salon_id: string;
  enabled: boolean;
  primary_color: string;
  position: 'bottom-right' | 'bottom-left';
  languages: Language[];
  default_language: Language;
  show_artist_selection: boolean;
  welcome_message: string;
  welcome_message_ar: string;
  welcome_message_fr: string;
}

export type WidgetStep = 'language' | 'service' | 'datetime' | 'artist' | 'details' | 'confirm' | 'success';

export interface WidgetBookingState {
  step: WidgetStep;
  language: Language;
  selected_services: string[];
  selected_package?: string;
  selected_date?: string;
  selected_time?: string;
  selected_staff?: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  notes?: string;
}

// ========== 🛡️ DATABASE & LOGS ==========

export interface WalkInClient {
  id: string;
  salon_id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  age_group?: AgeGroup;
  notes?: string;
  total_spent: number;
  total_visits: number;
  created_at: string;
}

export interface ErrorLog {
  id: string;
  salon_id?: string;
  type: 'api' | 'message' | 'system';
  error: string;
  details?: string;
  resolved: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  salon_id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
}