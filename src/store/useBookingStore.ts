import { create } from 'zustand';
import { supabase } from '@/shared/lib/supabase';
import { toUTC, fromUTC } from '@/shared/utils/date-logic';
import { handleWhatsAppDispatch } from '@/shared/utils/whatsappGateway';
import { 
  SalonProfile, Service, ServicePackage, Staff, FAQ, GiftCard, 
  Client, Booking, LoyaltySettings, DailyMessageLimits, 
  Message, ServiceCategory, BookingStatus 
} from '@/types';

const DEFAULT_SALON_ID = "00000000-0000-0000-0000-000000000001";

interface BookingStoreState {
  salonProfile: SalonProfile | null;
  categories: ServiceCategory[];
  services: Service[];
  packages: ServicePackage[];
  staff: Staff[];
  faqs: FAQ[];
  clients: Client[];
  bookings: Booking[];
  giftCards: GiftCard[];
  loyaltySettings: LoyaltySettings | null;
  dailyLimits: DailyMessageLimits | null;
  messages: Message[];
  crmEbooks: any[];
  loading: boolean;
  lastFetchedId: string | null;
  lastFetchTime: number; // 🆕 Track last fetch time

  fetchData: (salonId?: string) => Promise<void>;
  createDemoSalon: (salonId?: string) => Promise<any>;
  fetchCrmEbooks: () => Promise<void>;
  addCrmEbook: (book: { title: string; category_type: string; file_url: string; language: string }) => Promise<void>;
  deleteCrmEbook: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<SalonProfile>) => Promise<void>;
  updateLoyaltySettings: (settings: Partial<LoyaltySettings>) => Promise<void>;
  addService: (data: any) => Promise<void>;
  updateService: (id: string, data: any) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addStaff: (data: any) => Promise<void>;
  updateStaff: (id: string, data: any) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addClient: (data: any) => Promise<void>;
  updateClient: (id: string, data: any) => Promise<void>;
  addPackage: (data: any) => Promise<void>;
  updatePackage: (id: string, data: any) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  addFAQ: (data: any) => Promise<void>;
  updateFAQ: (id: string, data: any) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;
  addBooking: (bookingData: any) => Promise<void>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  addGiftCard: (data: any) => Promise<void>;
  canSendMessage: (type: 'confirmation' | 'reminder' | 'promotion' | 'custom' | 'staff_alert') => boolean;
  canSendWhatsApp: (salonId: string, category: 'confirmation' | 'reminder' | 'promotion' | 'custom') => Promise<boolean>;
  sendConfirmation: (bookingId: string) => Promise<void>;
  sendReminder: (bookingId: string) => Promise<void>;
  queuePromotion: (data: any) => Promise<void>;
  getTodayBookings: () => Booking[];
}

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  salonProfile: null,
  categories: [],
  services: [],
  packages: [],
  staff: [],
  faqs: [],
  clients: [],
  bookings: [],
  giftCards: [],
  loyaltySettings: null,
  dailyLimits: null,
  messages: [],
  crmEbooks: [],
  loading: false,
  lastFetchedId: null,
  lastFetchTime: 0,

  fetchData: async (salonId?: string) => {
    console.log("📡 DATABASE CALL: fetchData triggered for", salonId);
    const targetId = salonId || DEFAULT_SALON_ID;
    const state = get();
    
    // 🛡️ SAFETY LOCK #1: Prevent if already loading
    if (state.loading) return;
    
    // 🛡️ SAFETY LOCK #2: Prevent if same ID was just fetched
    if (state.lastFetchedId === targetId) {
      console.log("🚫 Skipping fetch - same ID already loaded:", targetId);
      return;
    }
    
    // 🛡️ SAFETY LOCK #3: Throttle - prevent calls within 5 seconds
    const now = Date.now();
    if (now - state.lastFetchTime < 5000) {
      console.log("🚨 THROTTLED: Too many fetch requests");
      return;
    }
    
    set({ loading: true, lastFetchTime: now });
    
    // 🛡️ SAFETY LOCK #4: Mark this ID as currently being fetched
    set({ lastFetchedId: targetId });

    try {
      console.log("🛰️ Fetching data for salon ID:", targetId);
      
      const [profile, limits, settings, cats, servs, pkgs, stf, fq, cls, bks, gcs] = await Promise.all([
        supabase.from('salons').select('*').eq('id', targetId).maybeSingle(),
        supabase.from('daily_message_limits').select('*').eq('salon_id', targetId).maybeSingle(),
        supabase.from('marketing_settings').select('*').eq('salon_id', targetId).maybeSingle(),
        supabase.from('service_categories').select('*').eq('salon_id', targetId),
        supabase.from('services').select('*').eq('salon_id', targetId),
        supabase.from('packages').select('*').eq('salon_id', targetId),
        supabase.from('staff').select('*').eq('salon_id', targetId),
        supabase.from('faqs').select('*').eq('salon_id', targetId),
        supabase.from('clients').select('*').eq('salon_id', targetId),
        supabase.from('bookings').select('*, clients(*)').eq('salon_id', targetId).order('appointment_time', { ascending: false }),
        supabase.from('gift_cards').select('*').eq('salon_id', targetId)
      ]);

      console.log("✅ Data fetched successfully for:", targetId);
      
      set({
        salonProfile: profile.data,
        dailyLimits: limits.data,
        loyaltySettings: settings.data,
        categories: cats.data || [],
        services: servs.data || [],
        packages: pkgs.data || [],
        staff: stf.data || [],
        faqs: fq.data || [],
        clients: cls.data || [],
        bookings: bks.data || [],
        giftCards: gcs.data || [],
        loading: false
      });
    } catch (err) {
      console.error("❌ Fetch failed", err);
      set({ loading: false });
    }
  },

  createDemoSalon: async (salonId?: string) => {
    const id = salonId || DEFAULT_SALON_ID;
    try {
      const { data, error } = await supabase
        .from('salons')
        .upsert({
          id: id,
          name: 'Demo Salon',
          email: 'demo@salon.com',
          phone: '1234567890',
          currency: 'USD',
          package: 'pro',
          status: 'active',
          timezone: 'UTC',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select()
        .single();
      
      if (error) throw error;
      
      const today = new Date().toISOString().split('T')[0];
      await Promise.all([
        supabase.from('daily_message_limits').upsert({
          salon_id: id, date: today, used_confirmation: 0, used_reminder: 0, used_promotion: 0, used_custom: 0
        }, { onConflict: 'salon_id,date' }),
        supabase.from('loyalty_settings').upsert({
          salon_id: id, enabled: true, points_per_visit: 10, points_per_spend: 1, points_to_redeem: 100, redeem_value: 50
        }, { onConflict: 'salon_id' }),
        supabase.from('marketing_settings').upsert({
          salon_id: id, threshold_regular: 1000, threshold_premium: 3000, threshold_vip: 5000, confirmation_limit: 50, reminder_limit: 50, promotion_limit: 50, custom_limit: 50
        }, { onConflict: 'salon_id' })
      ]);
      
      return data;
    } catch (error) {
      console.error("Failed to create demo salon:", error);
      return null;
    }
  },

  canSendMessage: (type) => {
    const { dailyLimits } = get();
    if (!dailyLimits) return true;
    const limit = 50;
    let used = 0;
    switch (type) {
      case 'confirmation': used = dailyLimits.used_confirmation || 0; break;
      case 'reminder': used = dailyLimits.used_reminder || 0; break;
      case 'promotion': used = dailyLimits.used_promotion || 0; break;
      case 'custom':
      case 'staff_alert': used = dailyLimits.used_custom || 0; break;
    }
    return used < limit;
  },

  canSendWhatsApp: async (salonId, category) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('daily_message_limits').select('*').eq('salon_id', salonId).eq('date', today).single();
    return (data?.[`used_${category}`] || 0) < 50;
  },

  fetchCrmEbooks: async () => {
    const { data } = await supabase.from('crm_ebooks').select('*').order('created_at', { ascending: false });
    set({ crmEbooks: data || [] });
  },

  addCrmEbook: async (book) => {
    const { error, data } = await supabase.from('crm_ebooks').insert([book]).select().single();
    if (!error && data) {
      set(state => ({ crmEbooks: [data, ...state.crmEbooks] }));
    }
  },

  deleteCrmEbook: async (id) => {
    const { error } = await supabase.from('crm_ebooks').delete().eq('id', id);
    if (!error) {
      set(state => ({ crmEbooks: state.crmEbooks.filter(book => book.id !== id) }));
    }
  },

  updateProfile: async (updates) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { error, data } = await supabase.from('salons')
      .update(updates)
      .eq('id', salonProfile.id)
      .select()
      .single();
    
    if (!error && data) {
      set({ salonProfile: data });
    }
  },

  updateLoyaltySettings: async (settings) => {
    const { salonProfile } = get();
    if (!salonProfile?.id) return;
    
    const { error, data } = await supabase.from('loyalty_settings')
      .update(settings)
      .eq('salon_id', salonProfile.id)
      .select()
      .single();
    
    if (!error && data) {
      set({ loyaltySettings: data });
    }
  },

  addService: async (data) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { data: newService, error } = await supabase
      .from('services')
      .insert([{ ...data, salon_id: salonProfile.id }])
      .select()
      .single();
    
    if (!error && newService) {
      set(state => ({ services: [...state.services, newService] }));
    }
  },

  updateService: async (id, data) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { data: updatedService, error } = await supabase
      .from('services')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && updatedService) {
      set(state => ({
        services: state.services.map(service => 
          service.id === id ? updatedService : service
        )
      }));
    }
  },

  deleteService: async (id) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { error } = await supabase.from('services').delete().eq('id', id);
    
    if (!error) {
      set(state => ({
        services: state.services.filter(service => service.id !== id)
      }));
    }
  },

  addStaff: async (data) => {
    const { staff, salonProfile } = get();
    if (!salonProfile) return;
    
    if (staff.length >= (salonProfile.max_staff_limit || 2)) {
      throw new Error('LIMIT_REACHED');
    }
    
    const { data: newStaff, error } = await supabase
      .from('staff')
      .insert([{ ...data, salon_id: salonProfile.id }])
      .select()
      .single();
    
    if (!error && newStaff) {
      set(state => ({ staff: [...state.staff, newStaff] }));
    }
  },

  updateStaff: async (id, data) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { data: updatedStaff, error } = await supabase
      .from('staff')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && updatedStaff) {
      set(state => ({
        staff: state.staff.map(staff => 
          staff.id === id ? updatedStaff : staff
        )
      }));
    }
  },

  deleteStaff: async (id) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { error } = await supabase.from('staff').delete().eq('id', id);
    
    if (!error) {
      set(state => ({
        staff: state.staff.filter(staff => staff.id !== id)
      }));
    }
  },

 addCategory: async (name) => {
  const { salonProfile } = get();
  if (!salonProfile) return;
  await supabase.from('service_categories').insert([{ name, salon_id: salonProfile.id }]);
  get().fetchData(salonProfile.id); // This might cause a fetch
},

deleteCategory: async (id) => {
  const { salonProfile } = get();
  if (!salonProfile) return;
  await supabase.from('service_categories').delete().eq('id', id);
  get().fetchData(salonProfile.id); // This might cause a fetch
},

  addClient: async (data) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert([{ ...data, salon_id: salonProfile.id }])
      .select()
      .single();
    
    if (!error && newClient) {
      set(state => ({ clients: [...state.clients, newClient] }));
    }
  },

  updateClient: async (id, data) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && updatedClient) {
      set(state => ({
        clients: state.clients.map(client => 
          client.id === id ? updatedClient : client
        ),
        // Also update client info in bookings if needed
        bookings: state.bookings.map(booking => 
          booking.client_id === id ? { ...booking, clients: updatedClient } : booking
        )
      }));
    }
  },
//   addClient: async (data) => {
//   const { salonProfile } = get();
//   if (!salonProfile) return;
  
//   // Insert the new client
//   const { data: newClient, error } = await supabase
//     .from('clients')
//     .insert([{ ...data, salon_id: salonProfile.id }])
//     .select()
//     .single();
    
//   if (!error && newClient) {
//     // Update local state without re-fetching everything
//     set((state) => ({
//       clients: [...state.clients, newClient]
//     }));
//   }
// },

// updateClient: async (id, data) => {
//   const { salonProfile } = get();
//   if (!salonProfile) return;
  
//   await supabase.from('clients').update(data).eq('id', id);
  
//   // Update local state without re-fetching
//   set((state) => ({
//     clients: state.clients.map(client => 
//       client.id === id ? { ...client, ...data } : client
//     )
//   }));
// },

  addPackage: async (data) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { service_ids, ...pkgData } = data;
    
    const { data: newPkg, error } = await supabase
      .from('packages')
      .insert([{ ...pkgData, salon_id: salonProfile.id }])
      .select()
      .single();
    
    if (!error && newPkg) {
      if (service_ids && service_ids.length > 0) {
        const pkgServices = service_ids.map((sid: string) => ({ 
          package_id: newPkg.id, 
          service_id: sid 
        }));
        await supabase.from('package_services').insert(pkgServices);
      }
      
      set(state => ({ packages: [...state.packages, newPkg] }));
    }
  },

  updatePackage: async (id, data) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { service_ids, ...pkgData } = data;
    
    const { data: updatedPkg, error } = await supabase
      .from('packages')
      .update(pkgData)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && updatedPkg) {
      if (service_ids) {
        await supabase.from('package_services').delete().eq('package_id', id);
        const pkgServices = service_ids.map((sid: string) => ({ 
          package_id: id, 
          service_id: sid 
        }));
        await supabase.from('package_services').insert(pkgServices);
      }
      
      set(state => ({
        packages: state.packages.map(pkg => 
          pkg.id === id ? updatedPkg : pkg
        )
      }));
    }
  },

  deletePackage: async (id) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { error } = await supabase.from('packages').delete().eq('id', id);
    
    if (!error) {
      set(state => ({
        packages: state.packages.filter(pkg => pkg.id !== id)
      }));
    }
  },

  addFAQ: async (data) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { data: newFAQ, error } = await supabase
      .from('faqs')
      .insert([{ ...data, salon_id: salonProfile.id }])
      .select()
      .single();
    
    if (!error && newFAQ) {
      set(state => ({ faqs: [...state.faqs, newFAQ] }));
    }
  },

  updateFAQ: async (id, data) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { data: updatedFAQ, error } = await supabase
      .from('faqs')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && updatedFAQ) {
      set(state => ({
        faqs: state.faqs.map(faq => 
          faq.id === id ? updatedFAQ : faq
        )
      }));
    }
  },

  deleteFAQ: async (id) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    
    if (!error) {
      set(state => ({
        faqs: state.faqs.filter(faq => faq.id !== id)
      }));
    }
  },

  addBooking: async (data) => {
    const { salonProfile, canSendMessage } = get();
    if (!salonProfile) return;
    
    const utcTimestamp = toUTC(data.date, data.startTime, salonProfile.timezone);
    
    const { data: newBooking, error } = await supabase
      .from('bookings')
      .insert([{
        salon_id: salonProfile.id, 
        client_id: data.clientId, 
        staff_id: data.staffId, 
        appointment_time: utcTimestamp,
        duration_minutes: data.duration, 
        total_price: data.totalPrice, 
        final_price: data.finalPrice, 
        status: 'pending'
      }])
      .select('*, clients(*)')
      .single();
    
    if (error) {
      console.error("Failed to add booking:", error);
      return;
    }
    
    if (newBooking) {
      // Update local state
      set(state => ({ bookings: [newBooking, ...state.bookings] }));
      
      // Send WhatsApp confirmation if allowed
      if (canSendMessage('confirmation')) {
        await handleWhatsAppDispatch({ 
          type: 'instant', 
          phone: data.clientPhone, 
          content: `Confirmed at ${salonProfile.name}`, 
          salonId: salonProfile.id 
        });
      }
    }
  },

  updateBookingStatus: async (id, status) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select('*, clients(*)')
      .single();
    
    if (!error && updatedBooking) {
      set(state => ({
        bookings: state.bookings.map(booking => 
          booking.id === id ? updatedBooking : booking
        )
      }));
    }
  },

  addGiftCard: async (data) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    
    const { data: newGiftCard, error } = await supabase
      .from('gift_cards')
      .insert([{ ...data, salon_id: salonProfile.id }])
      .select()
      .single();
    
    if (!error && newGiftCard) {
      set(state => ({ giftCards: [...state.giftCards, newGiftCard] }));
    }
  },

  sendConfirmation: async (bookingId) => {
    const { salonProfile, bookings, canSendMessage } = get();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!salonProfile || !booking || !canSendMessage('confirmation')) return;
    
    const content = `Confirmed for ${fromUTC(booking.appointment_time, salonProfile.timezone).toFormat('LLL dd')}`;
    
    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert([{ 
        salon_id: salonProfile.id, 
        booking_id: bookingId, 
        recipient_phone: booking.clients?.phone, 
        content, 
        type: 'confirmation', 
        status: 'sent' 
      }])
      .select()
      .single();
    
    if (!error && newMessage) {
      set(state => ({ messages: [...state.messages, newMessage] }));
    }
  },

  sendReminder: async (bookingId) => {
    const { salonProfile, bookings, canSendMessage } = get();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!salonProfile || !booking || !canSendMessage('reminder')) return;
    
    const content = `Reminder for today at ${fromUTC(booking.appointment_time, salonProfile.timezone).toFormat('hh:mm a')}`;
    
    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert([{ 
        salon_id: salonProfile.id, 
        booking_id: bookingId, 
        recipient_phone: booking.clients?.phone, 
        content, 
        type: 'reminder', 
        status: 'sent' 
      }])
      .select()
      .single();
    
    if (!error && newMessage) {
      set(state => ({ messages: [...state.messages, newMessage] }));
    }
  },

  queuePromotion: async (data) => {
    const { salonProfile, canSendMessage } = get();
    if (!salonProfile || !canSendMessage('promotion')) return;
    
    const { data: queuedMessage, error } = await supabase
      .from('message_queue')
      .insert([{ 
        salon_id: salonProfile.id, 
        recipient_phone: data.phone, 
        content: data.content, 
        type: 'promotion', 
        status: 'queued' 
      }])
      .select()
      .single();
    
    if (!error && queuedMessage) {
      // You might want to add this to a separate messageQueue state
      console.log("Message queued:", queuedMessage);
    }
  },

  getTodayBookings: () => {
    const { bookings, salonProfile } = get();
    if (!salonProfile) return [];
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(b => fromUTC(b.appointment_time, salonProfile.timezone).toFormat('yyyy-MM-dd') === today);
  }
}));