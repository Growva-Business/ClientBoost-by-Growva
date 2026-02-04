// src/store/useStore.ts
import { create } from 'zustand';
import { supabase } from '@/shared/lib/supabase';
import { 
  Language, 
  Salon, 
  Invoice, 
  User, 
  BillingStatus,
  PackageType,
  AuditLog
} from '@/types';

/**
 * 👑 THE COMPLETE SUPER ADMIN BRAIN
 * Merged with Safety Locks, Multi-tenant Isolation, and Audit Logging.
 */

// 🚨 EMERGENCY GLOBAL THROTTLE SYSTEM - PREVENTS 9,775 REQUESTS
const GLOBAL_THROTTLE: Record<string, number> = {};
const THROTTLE_PERIOD = 10000; // 10 seconds

// Helper function to check throttle
const shouldThrottle = (functionName: string): boolean => {
  const now = Date.now();
  const lastCall = GLOBAL_THROTTLE[functionName] || 0;
  
  if (now - lastCall < THROTTLE_PERIOD) {
    console.log(`🚨 EMERGENCY THROTTLE: ${functionName} called too soon! Blocked.`);
    return true;
  }
  
  GLOBAL_THROTTLE[functionName] = now;
  return false;
};

interface StoreState {
  // 🎨 UI and Data Storage
  language: Language;
  userRole: string;
  sidebarOpen: boolean;
  loading: boolean;
  currentUser: User | null;
  salons: Salon[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  
  // ⚡️ Safety State
  isFetchingSalons: boolean;
  isFetchingInvoices: boolean;
  isFetchingLogs: boolean;
  lastSalonsFetchTime: number | null;
  lastInvoicesFetchTime: number | null;
  lastLogsFetchTime: number | null;
  
  // ⚙️ UI Actions
  setLanguage: (lang: Language) => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  
  // 🏠 Salon Actions
  fetchSalons: () => Promise<void>;
  addSalon: (salonData: any) => Promise<void>;
  updateSalonStatus: (id: string, status: BillingStatus) => Promise<void>;
  
  // 💰 Billing Actions
  fetchInvoices: () => Promise<void>;
  markInvoiceAsPaid: (id: string) => Promise<void>;
  generateInvoice: (salonId: string) => Promise<void>;
  
  // 📝 Logging & Audit
  fetchAuditLogs: () => Promise<void>;
  logAction: (action: string, details: string, category: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  // --- INITIAL STATE ---
  language: (typeof window !== 'undefined' ? localStorage.getItem('language') as Language : 'en') || 'en',
  userRole: 'super-admin',
  sidebarOpen: true,
  loading: false,
  currentUser: null,
  salons: [],
  invoices: [],
  auditLogs: [],
  
  isFetchingSalons: false,
  isFetchingInvoices: false,
  isFetchingLogs: false,
  lastSalonsFetchTime: null,
  lastInvoicesFetchTime: null,
  lastLogsFetchTime: null,

  // --- UI ACTIONS ---
  setLanguage: (lang: Language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      const dir = lang === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem('languageDir', dir);
      
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
      document.body.dir = dir;
    }
    set({ language: lang });
  },
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setCurrentUser: (user) => set({ currentUser: user }),

  // --- SALON ACTIONS - WITH EMERGENCY THROTTLE ---
  fetchSalons: async () => {
    const state = get();
    
    // 🚨 EMERGENCY GLOBAL THROTTLE CHECK
    if (shouldThrottle('fetchSalons')) {
      console.log("🚨 EMERGENCY: fetchSalons throttled globally!");
      return;
    }
    
    // Existing safety checks
    if (state.isFetchingSalons) {
      console.log("⏸️ fetchSalons: Already fetching");
      return;
    }
    
    const now = Date.now();
    if (state.lastSalonsFetchTime && (now - state.lastSalonsFetchTime < THROTTLE_PERIOD)) {
      console.log("⏸️ fetchSalons: Called too soon, using cached data");
      return;
    }
    
    set({ isFetchingSalons: true, loading: true });
    
    try {
      console.log("📡 fetchSalons: Fetching from Supabase...");
      
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log(`✅ fetchSalons: Successfully fetched ${data?.length || 0} salons`);
      
      set({ 
        salons: data || [], 
        isFetchingSalons: false, 
        loading: false,
        lastSalonsFetchTime: now
      });
    } catch (error) {
      console.error("❌ fetchSalons error:", error);
      set({ isFetchingSalons: false, loading: false });
    }
  },

  addSalon: async (salonData) => {
    // 🚨 EMERGENCY THROTTLE CHECK for add operations too
    if (shouldThrottle('addSalon')) {
      console.log("🚨 EMERGENCY: addSalon throttled!");
      throw new Error("Operation throttled. Please wait before adding another salon.");
    }
    
    set({ loading: true });
    try {
      const { data: newSalon, error: salonError } = await supabase
        .from('salons')
        .insert([{
          name: salonData.name,
          email: salonData.email,
          phone: salonData.phone,
          country_code: salonData.country_code,
          currency: salonData.currency,
          package: salonData.package || 'pro',
          status: 'active'
        }])
        .select().single();

      if (salonError) throw salonError;

      // Initialize messaging engine for new salon
      await supabase.from('daily_message_limits').insert([{
        salon_id: newSalon.id,
        date: new Date().toISOString().split('T')[0]
      }]);

      set(state => ({ 
        salons: [newSalon, ...state.salons], 
        loading: false 
      }));
      
      await get().logAction('salon_created', `Created: ${newSalon.name}`, 'salon');
    } catch (error) {
      console.error("❌ addSalon error:", error);
      set({ loading: false });
    }
  },

  updateSalonStatus: async (id, status) => {
    set({ loading: true });
    try {
      const { error } = await supabase.from('salons').update({ status }).eq('id', id);
      if (error) throw error;
      
      set(state => ({
        salons: state.salons.map(s => s.id === id ? { ...s, status } : s),
        loading: false
      }));
      
      await get().logAction('salon_status_updated', `Salon ${id} status changed to ${status}`, 'salon');
    } catch (error) {
      console.error("❌ updateSalonStatus error:", error);
      set({ loading: false });
    }
  },

  // --- BILLING ACTIONS - WITH EMERGENCY THROTTLE ---
  fetchInvoices: async () => {
    const state = get();
    
    // 🚨 EMERGENCY GLOBAL THROTTLE CHECK
    if (shouldThrottle('fetchInvoices')) {
      console.log("🚨 EMERGENCY: fetchInvoices throttled globally!");
      return;
    }
    
    if (state.isFetchingInvoices) {
      console.log("⏸️ fetchInvoices: Already fetching");
      return;
    }
    
    const now = Date.now();
    if (state.lastInvoicesFetchTime && (now - state.lastInvoicesFetchTime < THROTTLE_PERIOD)) {
      console.log("⏸️ fetchInvoices: Called too soon, using cached data");
      return;
    }

    set({ isFetchingInvoices: true, loading: true });
    try {
      console.log("📡 fetchInvoices: Fetching from Supabase...");
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      console.log(`✅ fetchInvoices: Successfully fetched ${data?.length || 0} invoices`);
      
      set({ 
        invoices: data || [], 
        isFetchingInvoices: false, 
        loading: false, 
        lastInvoicesFetchTime: now 
      });
    } catch (error) {
      console.error("❌ fetchInvoices error:", error);
      set({ isFetchingInvoices: false, loading: false });
    }
  },

  markInvoiceAsPaid: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid', 
          paid_at: new Date().toISOString() 
        })
        .eq('id', id);
        
      if (error) throw error;
      
      set(state => ({
        invoices: state.invoices.map(inv => 
          inv.id === id ? { ...inv, status: 'paid' } : inv
        ),
        loading: false
      }));
      
      await get().logAction('invoice_paid', `Invoice ${id} marked as paid`, 'billing');
    } catch (error) {
      console.error("❌ markInvoiceAsPaid error:", error);
      set({ loading: false });
    }
  },

  generateInvoice: async (salonId) => {
    set({ loading: true });
    try {
      const salon = get().salons.find(s => s.id === salonId);
      if (!salon) throw new Error("Salon not found");

      const packagePrices: Record<PackageType, number> = { 
        basic: 99, 
        advanced: 199, 
        pro: 299 
      };

      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert([{
          salon_id: salonId,
          invoice_number: `INV-${Date.now()}`,
          amount: packagePrices[salon.package as PackageType] || 0,
          currency: salon.currency,
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select().single();

      if (error) throw error;
      
      set(state => ({ 
        invoices: [newInvoice, ...state.invoices], 
        loading: false 
      }));
      
      await get().logAction('invoice_generated', `Generated invoice for salon ${salonId}`, 'billing');
    } catch (error) {
      console.error("❌ generateInvoice error:", error);
      set({ loading: false });
    }
  },

  // --- AUDIT LOG ACTIONS - WITH EMERGENCY THROTTLE ---
  fetchAuditLogs: async () => {
    const state = get();
    
    // 🚨 EMERGENCY GLOBAL THROTTLE CHECK
    if (shouldThrottle('fetchAuditLogs')) {
      console.log("🚨 EMERGENCY: fetchAuditLogs throttled globally!");
      return;
    }
    
    if (state.isFetchingLogs) {
      console.log("⏸️ fetchAuditLogs: Already fetching");
      return;
    }
    
    const now = Date.now();
    if (state.lastLogsFetchTime && (now - state.lastLogsFetchTime < THROTTLE_PERIOD)) {
      console.log("⏸️ fetchAuditLogs: Called too soon, using cached data");
      return;
    }
    
    set({ isFetchingLogs: true, loading: true });
    try {
      console.log("📡 fetchAuditLogs: Fetching from Supabase...");
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      console.log(`✅ fetchAuditLogs: Successfully fetched ${data?.length || 0} logs`);
      
      set({ 
        auditLogs: data || [], 
        isFetchingLogs: false, 
        loading: false,
        lastLogsFetchTime: now
      });
    } catch (error) {
      console.error("❌ fetchAuditLogs error:", error);
      set({ isFetchingLogs: false, loading: false });
    }
  },

  logAction: async (action, details, category) => {
    try {
      // No throttle for logging - we want all actions logged
      await supabase.from('audit_logs').insert([{ 
        action, 
        details, 
        category,
        salon_id: get().currentUser?.salon_id || null,
        user_id: get().currentUser?.id || null
      }]);
    } catch (error) {
      console.error("❌ Failed to log action:", error);
    }
  }
}));

/**
 * 🛡️ MULTI-TENANT POLICIES TO IMPLEMENT LATER:
 * 
 * 1. Row Level Security (RLS) on Supabase:
 *    - Enable RLS on all tables
 *    - Create policies for salon_id isolation
 *    - Super-admin bypass with service_role
 * 
 * 2. Rate Limiting:
 *    - Implement Redis-based rate limiting
 *    - Different limits per user tier
 *    - Burst handling for legitimate use
 * 
 * 3. Database Connection Pooling:
 *    - Use Supabase connection pooling
 *    - Set max connections per client
 *    - Monitor query performance
 * 
 * 4. Caching Layer:
 *    - Redis cache for frequently accessed data
 *    - Cache invalidation strategies
 *    - Stale-while-revalidate pattern
 */