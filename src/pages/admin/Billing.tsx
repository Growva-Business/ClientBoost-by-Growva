import { create } from 'zustand';
import { useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';

import { 
  Language, 
  Salon, 
  Invoice, 
  User, 
  BillingStatus,
  PackageType
} from '@/types';

/**
 * 👑 THE COMPLETE SUPER ADMIN BRAIN
 * This version has EVERY action needed for Salons and Billing.
 */

interface StoreState {
  // 🎨 UI and Data Storage
  language: Language;
  sidebarOpen: boolean;
  loading: boolean;
  currentUser: User | null;
  salons: Salon[];
  invoices: Invoice[];
  
  // ⚙️ UI Actions
  setLanguage: (lang: Language) => void;
  setSidebarOpen: (open: boolean) => void;
  
  // 🏠 Salon Actions (Phase 2)
  fetchSalons: () => Promise<void>;
  addSalon: (salonData: any) => Promise<void>;
  updateSalonStatus: (id: string, status: BillingStatus) => Promise<void>;
  
  // 💰 Billing Actions (Phase 2)
  fetchInvoices: () => Promise<void>;
  markInvoiceAsPaid: (id: string) => Promise<void>;
  generateInvoice: (salonId: string) => Promise<void>;
  
  // 📝 Logging (Global)
  logAction: (action: string, details: string, category: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  // --- INITIAL STATE ---
  language: 'en',
  sidebarOpen: true,
  loading: false,
  currentUser: null,
  salons: [],
  invoices: [],

  // --- UI ACTIONS ---
 
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // --- SALON ACTIONS ---
  fetchSalons: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching salons:", error.message);
    } else {
      set({ salons: data || [] });
    }
    set({ loading: false });
  },

  // Updated addSalon for 50/50/50/50 strategy
  addSalon: async (salonData) => {
    set({ loading: true });
    
    // 1. Create the Salon
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

    if (salonError) {
      console.error("Failed to create salon:", salonError.message);
      set({ loading: false });
      return;
    }

    // 2. Initialize the "50/50/50/50" Messaging Engine
    const { error: limitError } = await supabase
      .from('daily_message_limits')
      .insert([{
        salon_id: newSalon.id,
        date: new Date().toISOString().split('T')[0],
        used_confirmation: 0,
        used_reminder: 0,
        used_promotion: 0,
        used_custom: 0 // <--- ADDED THE 4th 50-unit CATEGORY
      }]);

    if (limitError) console.error("Limit Setup Error:", limitError.message);

    // 3. Refresh the UI
    await get().fetchSalons();
    set({ loading: false });
  },
setLanguage: (lang) => {
  set({ language: lang });
  // You must also tell the app to refresh its translation dictionary
  localStorage.setItem('growva_lang', lang);
  
},
  updateSalonStatus: async (id, status) => {
    const { error } = await supabase
      .from('salons')
      .update({ status })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        salons: state.salons.map(s => s.id === id ? { ...s, status } : s)
      }));
      await get().logAction('status_change', `Salon ${id} set to ${status}`, 'billing');
    }
  },

  // --- BILLING ACTIONS ---
  fetchInvoices: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching invoices:", error.message);
    } else {
      set({ invoices: data || [] });
    }
    set({ loading: false });
  },

  markInvoiceAsPaid: async (id) => {
    const { error } = await supabase
      .from('invoices')
      .update({ 
        status: 'paid', 
        paid_at: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (error) {
      console.error("Payment update failed:", error.message);
    } else {
      await get().fetchInvoices();
      await get().logAction('payment_received', `Invoice ${id} marked as paid`, 'billing');
    }
  },

  generateInvoice: async (salonId) => {
    const salon = get().salons.find(s => s.id === salonId);
    if (!salon) return;

    // Prices matching our business rules
    const packagePrices: Record<PackageType, number> = {
      basic: 99,
      advanced: 199,
      pro: 299
    };

    const { error } = await supabase
      .from('invoices')
      .insert([{
        salon_id: salonId,
        invoice_number: `INV-${Date.now()}`,
        amount: packagePrices[salon.package as PackageType] || 0,
        currency: salon.currency,
        status: 'pending',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }]);

    if (error) {
      console.error("Invoice generation failed:", error.message);
    } else {
      await get().fetchInvoices();
      await get().logAction('invoice_generated', `New invoice for ${salon.name}`, 'billing');
    }
  },

  // --- LOGGING ---
  logAction: async (action, details, category) => {
    await supabase.from('audit_logs').insert([{
      action,
      details,
      category
    }]);
  }
}));

// Updated Billing component with proper TypeScript
export function Billing() {
  const { invoices, salons, loading, fetchSalons, fetchInvoices } = useStore();

  // Fetch salons and invoices when the page opens
  useEffect(() => {
    fetchSalons();
    fetchInvoices();
  }, []);

  if (loading) return <p className="p-6">Loading Billing Data...</p>;

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-black uppercase">🏢 Salons Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Salons Section */}
        <div>
          <h3 className="text-xl font-bold mb-4">Active Salons ({salons.length})</h3>
          <div className="space-y-4">
            {salons.map((salon) => (
              <div key={salon.id} className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm flex justify-between">
                <div>
                  <p className="font-bold text-lg">{salon.name}</p>
                  <p className="text-sm text-gray-500">{salon.email}</p>
                  <p className="text-xs text-gray-400">{salon.package}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold self-center ${
                  salon.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : salon.status === 'suspended'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {salon.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices Section */}
        <div>
          <h3 className="text-xl font-bold mb-4">Invoices ({invoices.length})</h3>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                <div className="flex justify-between mb-2">
                  <p className="font-bold">{invoice.invoice_number}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-700' 
                      : invoice.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {invoice.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Amount: {invoice.currency} {invoice.amount}</p>
                <p className="text-xs text-gray-500">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}