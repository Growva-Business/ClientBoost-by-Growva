import { create } from 'zustand';
import { supabase } from '@/shared/lib/supabase';
import { 
  Language, 
  Salon, 
  Invoice, 
  User, 
  BillingStatus,
  AuditLog
} from '@/types';

/**
 * 👑 THE COMPLETE SUPER ADMIN BRAIN
 * Now with Salon building, Money tools, and Diary fetching!
 */

interface StoreState {
  language: Language;
  sidebarOpen: boolean;
  loading: boolean;
  currentUser: User | null;
  salons: Salon[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  
  setLanguage: (lang: Language) => void;
  setSidebarOpen: (open: boolean) => void;
  
  // 🏠 Salon Actions
  fetchSalons: () => Promise<void>;
  addSalon: (salonData: any) => Promise<void>;
  updateSalonStatus: (id: string, status: BillingStatus) => Promise<void>;
  
  // 💰 Money Actions
  fetchInvoices: () => Promise<void>;
  markInvoiceAsPaid: (id: string) => Promise<void>;
  generateInvoice: (salonId: string) => Promise<void>;

  // 📝 Diary (Log) Actions
  fetchAuditLogs: () => Promise<void>;
  logAction: (action: string, details: string, category: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  language: 'en',
  sidebarOpen: true,
  loading: false,
  currentUser: null,
  salons: [],
  invoices: [],
  auditLogs: [],

  setLanguage: (lang) => set({ language: lang }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // --- GETTING SALONS ---
  fetchSalons: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) set({ salons: data || [] });
    set({ loading: false });
  },

  // --- ADDING A NEW SALON ---
 addSalon: async (salonData) => {
    set({ loading: true });
    
    try {
      // 1. Create the Salon Profile
      const { data: newSalon, error: salonError } = await supabase
        .from('salons')
        .insert([{
          name: salonData.name,
          email: salonData.email,
          phone: salonData.phone,
          country_code: salonData.country_code,
          currency: salonData.currency,
          timezone: salonData.timezone || 'UTC',
          package: salonData.package || 'pro',
          status: 'active'
        }])
        .select()
        .single();

      if (salonError) throw salonError;

      // 2. Initialize Messaging Engine (50/50/50/50 Counters)
      const { error: limitError } = await supabase
        .from('daily_message_limits')
        .insert([{
          salon_id: newSalon.id,
          date: new Date().toISOString().split('T')[0],
          used_confirmation: 0,
          used_reminder: 0,
          used_promotion: 0,
          used_custom: 0 
        }]);

      if (limitError) console.error("Messaging Limit Init Failed:", limitError.message);

      // 3. Initialize Marketing Settings (Thresholds + Limits)
      const { error: settingsError } = await supabase
        .from('marketing_settings')
        .insert([{
          salon_id: newSalon.id,
          threshold_regular: 1000,
          threshold_premium: 3000,
          threshold_vip: 5000,
          confirmation_limit: 50,
          reminder_limit: 50,
          promotion_limit: 50,
          custom_limit: 50
        }]);

      if (settingsError) console.error("Marketing Settings Init Failed:", settingsError.message);

      // 4. Log the Audit and Refresh List
      await get().logAction('salon_created', `Created salon: ${newSalon.name}`, 'salon');
      await get().fetchSalons();
      
    } catch (error: any) {
      console.error("Critical Salon Creation Failure:", error.message);
      // Optional: Add a notification or alert here for the user
    } finally {
      // ALWAYS stop the loading spinner, even if database failed
      set({ loading: false });
    }
  },
  updateSalonStatus: async (id, status) => {
    const { error } = await supabase.from('salons').update({ status }).eq('id', id);
    if (!error) {
      set((state) => ({
        salons: state.salons.map(s => s.id === id ? { ...s, status } : s)
      }));
      await get().logAction('status_change', `Salon ${id} set to ${status}`, 'billing');
    }
  },

  // --- MONEY ACTIONS ---
  fetchInvoices: async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) set({ invoices: data || [] });
  },

  markInvoiceAsPaid: async (id) => {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id);
    
    if (!error) {
      await get().fetchInvoices();
      await get().logAction('payment_received', `Invoice ${id} paid`, 'billing');
    }
  },

  generateInvoice: async (salonId) => {
    const salon = get().salons.find(s => s.id === salonId);
    if (!salon) return;

    const prices = { basic: 99, advanced: 199, pro: 299 };
    const amount = prices[salon.package as keyof typeof prices] || 0;

    const { error } = await supabase.from('invoices').insert([{
      salon_id: salonId,
      invoice_number: `INV-${Date.now()}`,
      amount: amount,
      currency: salon.currency,
      status: 'pending',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }]);

    if (!error) await get().fetchInvoices();
  },

  // --- DIARY (LOG) ACTIONS ---
  fetchAuditLogs: async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) set({ auditLogs: data || [] });
  },

 // --- LOGGING ---
logAction: async (action, details, category) => {
  const { currentUser } = get();
  await supabase.from('audit_logs').insert([{
    action,
    details,
    category,
    // 🚀 Ensure salon_id is included so it shows in both dashboards
    salon_id: currentUser?.salon_id || null 
  }]);
  await get().fetchAuditLogs();
}
}));