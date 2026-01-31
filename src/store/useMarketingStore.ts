import { create } from 'zustand';
import { supabase } from '@/shared/lib/supabase';
import { 
  MarketingClient, Campaign, SavedFilter, 
  ClientTypeThresholds, MarketingAnalytics, ClientType ,StaffCommission
} from '@/types';



// 1. Define the Rules (Interface) First
interface MarketingStoreState {
  clients: MarketingClient[];
  campaigns: Campaign[];
  savedFilters: SavedFilter[];
  clientTypeThresholds: ClientTypeThresholds;
  currentFilter: Partial<SavedFilter>;
  loading: boolean;

  // Actions
  fetchMarketingData: (salonId: string) => Promise<void>;
  setCurrentFilter: (filter: Partial<SavedFilter>) => void;
  resetFilter: () => void;
  saveFilter: (name: string) => Promise<void>;
  
  // Campaign actions
  createCampaign: (campaign: Omit<Campaign, 'id' | 'created_at'>) => Promise<void>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  getStaffCommissions: (period: string) => StaffCommission[];
  
  // Client & Settings actions
  updateClientOptIn: (clientId: string, opt_in: boolean) => Promise<void>;
  updateThresholds: (thresholds: ClientTypeThresholds) => Promise<void>;

  // Computed
  getFilteredClients: () => MarketingClient[];
  getSafeClients: () => MarketingClient[];
  getAnalytics: () => MarketingAnalytics;
  getClientType: (totalSpent: number) => ClientType;
}

// 2. Create the Store using that Interface
export const useMarketingStore = create<MarketingStoreState>((set, get) => ({
  clients: [],
  campaigns: [],
  savedFilters: [],
  clientTypeThresholds: { regular: 1000, premium: 3000, vip: 5000 },
  currentFilter: { date_range: 'all', safe_only: false },
  loading: false,

 // Replace lines 51-76 in useMarketingStore.ts
fetchMarketingData: async (salonId) => {
    set({ loading: true });
    
    try {
      const [camps, settings, cls] = await Promise.all([
        supabase.from('campaigns').select('*').eq('salon_id', salonId),
        // Use maybeSingle() instead of single() to prevent crash on new salons
        supabase.from('marketing_settings').select('*').eq('salon_id', salonId).maybeSingle(),
        supabase.from('clients').select('*').eq('salon_id', salonId)
      ]);

      const marketingClients: MarketingClient[] = (cls.data || []).map(c => ({
        ...c,
        client_type: get().getClientType(c.total_spent || 0)
      }));

      set({
        campaigns: camps.data || [],
        clientTypeThresholds: settings.data ? {
          regular: settings.data.threshold_regular,
          premium: settings.data.threshold_premium,
          vip: settings.data.threshold_vip
        } : { regular: 1000, premium: 3000, vip: 5000 }, // Default fallback
        clients: marketingClients,
      });
    } catch (error) {
      console.error("Marketing Fetch Error:", error);
    } finally {
      set({ loading: false });
    }
},
  setCurrentFilter: (filter) => {
    set((state) => ({ currentFilter: { ...state.currentFilter, ...filter } }));
  },

  resetFilter: () => {
    set({ currentFilter: { date_range: 'all', safe_only: false } });
  },

  saveFilter: async (name) => {
    const { currentFilter, clients } = get();
    const salonId = clients[0]?.salon_id;
    if (!salonId) return;

    const { error } = await supabase.from('saved_filters').insert([{
      name,
      salon_id: salonId,
      ...currentFilter
    }]);

    if (!error) get().fetchMarketingData(salonId);
  },

  createCampaign: async (campaignData) => {
    const { error } = await supabase.from('campaigns').insert([campaignData]);
    if (!error && campaignData.salon_id) get().fetchMarketingData(campaignData.salon_id);
  },

  updateCampaign: async (id, updates) => {
    const { error } = await supabase.from('campaigns').update(updates).eq('id', id);
    const salonId = get().clients[0]?.salon_id;
    if (!error && salonId) get().fetchMarketingData(salonId);
  },

  deleteCampaign: async (id) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (!error) set({ campaigns: get().campaigns.filter(c => c.id !== id) });
  },

  updateClientOptIn: async (clientId, opt_in) => {
    const { error } = await supabase.from('clients').update({ opt_in }).eq('id', clientId);
    if (!error) {
      set((state) => ({
        clients: state.clients.map((c) => (c.id === clientId ? { ...c, opt_in } : c))
      }));
    }
  },

  updateThresholds: async (thresholds) => {
    const salonId = get().clients[0]?.salon_id;
    if (!salonId) return;

    const { error } = await supabase.from('marketing_settings').upsert({
      salon_id: salonId,
      threshold_regular: thresholds.regular,
      threshold_premium: thresholds.premium,
      threshold_vip: thresholds.vip
    });

    if (!error) {
      set({ clientTypeThresholds: thresholds });
      get().fetchMarketingData(salonId);
    }
  },

  getClientType: (totalSpent) => {
    const { clientTypeThresholds } = get();
    if (totalSpent >= clientTypeThresholds.vip) return 'vip';
    if (totalSpent >= clientTypeThresholds.premium) return 'premium';
    if (totalSpent >= clientTypeThresholds.regular) return 'regular';
    return 'new';
  },

  getFilteredClients: () => {
    const { clients, currentFilter } = get();
    return clients.filter(c => {
      if (currentFilter.client_type && c.client_type !== currentFilter.client_type) return false;
      if (currentFilter.safe_only && !c.opt_in) return false;
      return true;
    });
  },
// Inside useMarketingStore.ts implementation
  getStaffCommissions: (_period) => {
    // 🧸 Fixed: Updated mock data to match the StaffCommission interface (snake_case)
    return [
      { 
        staff_id: 'staff-1', 
        staff_name: 'Sara Ahmed', 
        total_bookings: 68, 
        total_revenue: 12500, 
        commission_percent: 30, 
        commission_earned: 3750, 
        period: 'May 2024' 
      },
      { 
        staff_id: 'staff-2', 
        staff_name: 'Fatima Hassan', 
        total_bookings: 55, 
        total_revenue: 8800, 
        commission_percent: 25, 
        commission_earned: 2200, 
        period: 'May 2024' 
      },
    ];
  },
  getSafeClients: () => {
    const { clients } = get();
    return clients.filter(c => c.opt_in && c.is_active);
  },

  getAnalytics: (): MarketingAnalytics => {
    const { clients } = get();
    return {
      total_active_clients: clients.length,
      new_clients_this_month: clients.filter(c => c.client_type === 'new').length,
      avg_client_spend: clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + (c.total_spent || 0), 0) / clients.length) : 0,
      avg_visit_frequency: 0,
      client_growth:0,
      retention_rate: 0,
      top_services: [],
      top_staff: [],
      revenue_by_month: [],
      clients_by_type: [
        { type: 'new', count: clients.filter(c => c.client_type === 'new').length },
        { type: 'regular', count: clients.filter(c => c.client_type === 'regular').length },
        { type: 'premium', count: clients.filter(c => c.client_type === 'premium').length },
        { type: 'vip', count: clients.filter(c => c.client_type === 'vip').length },
      ]
    };
  }
}));