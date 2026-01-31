import { create } from 'zustand';
import { supabase } from '@/shared/lib/supabase';
import { DateTime } from 'luxon'; 
import { toUTC, fromUTC } from '@/shared/utils/date-logic';
import { handleWhatsAppDispatch } from '@/shared/utils/whatsappGateway';
import { 
  SalonProfile, Service, ServicePackage, Staff, FAQ, GiftCard, 
  Client, Booking, LoyaltySettings, DailyMessageLimits, 
  Message, ServiceCategory, BookingStatus 
} from '@/types';

// 1. Define the store's interface clearly
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
  

  // Actions
  
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
  sendConfirmation: (bookingId: string) => Promise<void>;
  sendReminder: (bookingId: string) => Promise<void>;
  queuePromotion: (data: any) => Promise<void>;
  getTodayBookings: () => Booking[];
  canSendMessage: (type: 'confirmation' | 'reminder' | 'promotion' | 'custom' | 'staff_alert') => boolean;
  
}
interface BookingStoreState {
  fetchData: (salonId?: string) => Promise<void>;
  // ... other properties
  createDemoSalon: (salonId: string) => Promise<any>;
}

// 2. Implementation with fixed (set, get)
export const useBookingStore = create<BookingStoreState>()((set, get) => ({
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

  // ============= MESSAGE LIMIT CHECK FUNCTION =============
  canSendMessage: (type: 'confirmation' | 'reminder' | 'promotion' | 'custom' | 'staff_alert') => {
    const { dailyLimits } = get();
    if (!dailyLimits) {
      console.warn('No daily limits found');
      return true; // Allow sending if limits not loaded (fail-safe)
    }

    const limitValue = 50; // Hardcoded 50 limit for all types
    
    // Get the used count for this type
    let usedValue = 0;
    switch (type) {
      case 'confirmation':
        usedValue = dailyLimits.used_confirmation || 0;
        break;
      case 'reminder':
        usedValue = dailyLimits.used_reminder || 0;
        break;
      case 'promotion':
        usedValue = dailyLimits.used_promotion || 0;
        break;
      case 'custom':
      case 'staff_alert': // Treat staff alerts as custom messages
        usedValue = dailyLimits.used_custom || 0;
        break;
      default:
        console.warn(`Unknown message type: ${type}`);
        return true; // Allow unknown types (fail-safe)
    }

    const canSend = usedValue < limitValue;
    console.log(`Can send ${type}? Used: ${usedValue}, Limit: ${limitValue}, Result: ${canSend}`);
    
    return canSend;
  },
  // ============= END MESSAGE LIMIT CHECK =============
fetchData: async (salonId: string = '00000000-0000-0000-0000-000000000001') => {
  set({ loading: true });
  console.log("🚀 fetchData called with salonId:", salonId);
  
  try {
    // --- PART 1: SALON ID RESOLUTION (from original) ---
    let targetSalonId = salonId;
    
    if (!targetSalonId) {
      console.log("No salonId provided, fetching first salon...");
      const { data: salons, error } = await supabase
        .from('salons')
        .select('id')
        .limit(1);
      
      if (error || !salons || salons.length === 0) {
        console.log("No salons found, creating demo salon...");
        const demoSalonId = '00000000-0000-0000-0000-000000000001';
        const demoSalon = await get().createDemoSalon(demoSalonId);
        if (demoSalon) {
          targetSalonId = demoSalonId;
        } else {
          set({ loading: false });
          return;
        }
      } else {
        targetSalonId = salons[0].id;
      }
    }
    
    // --- PART 2: PROFILE & TIMEZONE LOGIC (from real version) ---
    const { data: profile, error: profileError } = await supabase
      .from('salons')
      .select('*')
      .eq('id', targetSalonId)
      .maybeSingle();

    // Safety check if profile is missing after resolution
    if (profileError || !profile) {
      console.log("Attempting to create missing salon...");
// To:
const newSalon = await get().createDemoSalon(targetSalonId || '00000000-0000-0000-0000-000000000001');
      if (newSalon) return get().fetchData(targetSalonId);
      set({ loading: false, salonProfile: null });
      return;
    }

    // Correctly calculate "today" using salon's specific timezone
    // Requires luxon (DateTime)
    const today = DateTime.now()
      .setZone(profile.timezone || 'UTC')
      .toISODate();

    console.log(`✅ Salon: ${profile.name} | Today: ${today}`);

    // --- PART 3: PARALLEL DATA FETCH (merged & verified) ---
    const [cats, servs, pkgs, stff, faqData, cls, bks, gcs, loy, lims, msgs] = await Promise.all([
      supabase.from('service_categories').select('*').eq('salon_id', targetSalonId),
      supabase.from('services').select('*').eq('salon_id', targetSalonId),
      supabase.from('packages').select('*, package_services(service_id)').eq('salon_id', targetSalonId),
      supabase.from('staff').select('*').eq('salon_id', targetSalonId),
      supabase.from('faqs').select('*').eq('salon_id', targetSalonId).order('order_index'),
      supabase.from('clients').select('*').eq('salon_id', targetSalonId),
      supabase.from('bookings').select('*, clients(name, phone)').eq('salon_id', targetSalonId),
      supabase.from('gift_cards').select('*').eq('salon_id', targetSalonId),
      supabase.from('loyalty_settings').select('*').eq('salon_id', targetSalonId).maybeSingle(),
      supabase.from('daily_message_limits').select('*').eq('salon_id', targetSalonId).eq('date', today).maybeSingle(),
      supabase.from('audit_logs').select('*').eq('salon_id', targetSalonId).order('created_at', { ascending: false }).limit(10)
    ]);

    // Update state with all fetched data
    set({
      salonProfile: profile,
      categories: cats.data || [],
      services: servs.data || [],
      packages: pkgs.data || [],
      staff: stff.data || [],
      faqs: faqData.data || [],
      clients: cls.data || [],
      bookings: bks.data || [],
      giftCards: gcs.data || [],
      loyaltySettings: loy.data || null,
      dailyLimits: lims.data || null,
      messages: msgs.data || [], 
    });

  } catch (err) {
    console.error("❌ Data Fetch Error:", err);
  } finally {
    set({ loading: false });
    console.log("🏁 Loading set to false");
  }
},
// In your useBookingStore.ts, add this function inside the store:
createDemoSalon: async (salonId: string) => {
  console.log("Creating demo salon with ID:", salonId);
  
  try {
    // Create the salon
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .insert([{
        id: salonId,
        name: 'Demo Salon',
        email: 'demo@salon.com',
        phone: '1234567890',
        currency: 'USD',
        package: 'pro',
        status: 'active',
        timezone: 'UTC'
      }])
      .select()
      .single();
    
    if (salonError && !salonError.message.includes('duplicate')) {
      console.error("Error creating salon:", salonError);
      return null;
    }
    
    console.log("Demo salon created/updated:", salon);
    return salon;
  } catch (error) {
    console.error("Error in createDemoSalon:", error);
    return null;
  }
},

  fetchCrmEbooks: async () => {
    const { data, error } = await supabase
      .from('crm_ebooks')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) set({ crmEbooks: data || [] });
  },

  addCrmEbook: async (book) => {
    const { error } = await supabase.from('crm_ebooks').insert([book]);
    if (!error) get().fetchCrmEbooks();
  },

  deleteCrmEbook: async (id) => {
    const { error } = await supabase.from('crm_ebooks').delete().eq('id', id);
    if (!error) get().fetchCrmEbooks();
  },

  // --- MESSAGING LOGIC WITH LIMIT CHECKS ---
  sendConfirmation: async (bookingId) => {
    const { salonProfile, bookings, canSendMessage } = get();
    const booking = bookings.find(b => b.id === bookingId);
    if (!salonProfile || !booking) return;

    // Check limit before sending
    if (!canSendMessage('confirmation')) {
      throw new Error('Daily confirmation message limit reached (50 messages max)');
    }

    const content = `Hi ${booking.clients?.name}, your appointment at ${salonProfile.name} is confirmed for ${fromUTC(booking.appointment_time, salonProfile.timezone).toFormat('LLL dd')} at ${fromUTC(booking.appointment_time, salonProfile.timezone).toFormat('hh:mm a')}.`;

    const { error } = await supabase.from('messages').insert([{
      salon_id: salonProfile.id,
      booking_id: bookingId,
      recipient_phone: booking.clients?.phone,
      content,
      type: 'confirmation',
      status: 'sent'
    }]);

    if (!error) get().fetchData(salonProfile.id);
  },

  sendReminder: async (bookingId) => {
    const { salonProfile, bookings, canSendMessage } = get();
    const booking = bookings.find(b => b.id === bookingId);
    if (!salonProfile || !booking) return;

    // Check limit before sending
    if (!canSendMessage('reminder')) {
      throw new Error('Daily reminder message limit reached (50 messages max)');
    }

    const content = `Reminder: You have an appointment today at ${salonProfile.name} at ${fromUTC(booking.appointment_time, salonProfile.timezone).toFormat('hh:mm a')}. See you soon!`;

    const { error } = await supabase.from('messages').insert([{
      salon_id: salonProfile.id,
      booking_id: bookingId,
      recipient_phone: booking.clients?.phone,
      content,
      type: 'reminder',
      status: 'sent'
    }]);

    if (!error) get().fetchData(salonProfile.id);
  },

  queuePromotion: async (data) => {
    const { salonProfile, canSendMessage } = get();
    if (!salonProfile) return;

    // Check limit before queuing
    if (!canSendMessage('promotion')) {
      throw new Error('Daily promotion message limit reached (50 messages max)');
    }

    const { error } = await supabase.from('message_queue').insert([{
      salon_id: salonProfile.id,
      recipient_phone: data.phone,
      content: data.content,
      type: 'promotion',
      status: 'queued'
    }]);

    if (!error) get().fetchData(salonProfile.id);
  },

  // --- ALL OTHER CRUD ACTIONS ---
  updateProfile: async (updates) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    await supabase.from('salons').update(updates).eq('id', salonProfile.id);
    get().fetchData(salonProfile.id);
  },

  addStaff: async (data) => {
    const { staff, salonProfile } = get();
    if (!salonProfile) return;

    if (staff.length >= (salonProfile.max_staff_limit || 2)) {
      throw new Error('LIMIT_REACHED');
    }

    const { error } = await supabase.from('staff').insert([{ ...data, salon_id: salonProfile.id }]);
    if (!error) get().fetchData(salonProfile.id);
  },

  updateStaff: async (id, data) => {
    const { salonProfile } = get();
    await supabase.from('staff').update(data).eq('id', id);
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  deleteStaff: async (id) => {
    const { salonProfile } = get();
    await supabase.from('staff').delete().eq('id', id);
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  addService: async (data) => {
    const { salonProfile } = get();
    await supabase.from('services').insert([data]);
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  updateService: async (id, data) => {
    const { salonProfile } = get();
    await supabase.from('services').update(data).eq('id', id);
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  deleteService: async (id) => {
    const { salonProfile } = get();
    await supabase.from('services').delete().eq('id', id);
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  addClient: async (data) => {
    const { salonProfile } = get();
    const { error } = await supabase.from('clients').insert([data]);
    if (!error && salonProfile) get().fetchData(salonProfile.id);
  },

  updateClient: async (id, data) => {
    const { salonProfile } = get();
    const { error } = await supabase.from('clients').update(data).eq('id', id);
    if (!error && salonProfile) get().fetchData(salonProfile.id);
  },

  addCategory: async (name: string) => {
    const { salonProfile } = get();
    if (!salonProfile) return;
    const { error } = await supabase.from('service_categories').insert([{ 
      name, 
      salon_id: salonProfile.id 
    }]);
    if (!error) get().fetchData(salonProfile.id);
  },

  deleteCategory: async (id: string) => {
    const { salonProfile } = get();
    const { error } = await supabase.from('service_categories').delete().eq('id', id);
    if (!error && salonProfile) get().fetchData(salonProfile.id);
  },

  addPackage: async (data) => {
    const { salonProfile } = get();
    const { service_ids, ...pkgData } = data;
    const { data: newPkg, error } = await supabase.from('packages').insert([pkgData]).select().single();
    if (!error && service_ids && newPkg) {
      const pkgServices = service_ids.map((sid: string) => ({ package_id: newPkg.id, service_id: sid }));
      await supabase.from('package_services').insert(pkgServices);
    }
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  updatePackage: async (id, data) => {
    const { salonProfile } = get();
    const { service_ids, ...pkgData } = data;
    await supabase.from('packages').update(pkgData).eq('id', id);
    if (service_ids) {
      await supabase.from('package_services').delete().eq('package_id', id);
      const pkgServices = service_ids.map((sid: string) => ({ package_id: id, service_id: sid }));
      await supabase.from('package_services').insert(pkgServices);
    }
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  deletePackage: async (id) => {
    const { salonProfile } = get();
    await supabase.from('packages').delete().eq('id', id);
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  addFAQ: async (data) => {
    const { salonProfile } = get();
    await supabase.from('faqs').insert([data]);
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  updateFAQ: async (id, data) => {
    const { salonProfile } = get();
    await supabase.from('faqs').update(data).eq('id', id);
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  deleteFAQ: async (id) => {
    const { salonProfile } = get();
    await supabase.from('faqs').delete().eq('id', id);
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  updateLoyaltySettings: async (settings) => {
    const { salonProfile } = get();
    if (!salonProfile?.id) return;
    const { error } = await supabase.from('loyalty_settings').update(settings).eq('salon_id', salonProfile.id);
    if (!error) await get().fetchData(salonProfile.id);
  },

  addBooking: async (data: any) => {
    const { salonProfile, staff, messages, canSendMessage } = get();
    if (!salonProfile) return;

    const today = new Date().toISOString().split('T')[0];
    const utcTimestamp = toUTC(data.date, data.startTime, salonProfile.timezone);

    // 1. Strict Counting Logic
    const confirmationsToday = messages.filter(m => 
      (m.type as string) === 'confirmation' && m.created_at?.startsWith(today)
    ).length;

    const staffAlertsToday = messages.filter(m => 
      (m.type as string) === 'staff_alert' && m.created_at?.startsWith(today)
    ).length;

    // 2. Save Booking to Supabase
    const { error: dbError } = await supabase.from('bookings').insert([{
      salon_id: salonProfile.id,
      client_id: data.clientId,
      staff_id: data.staffId,
      appointment_time: utcTimestamp,
      duration_minutes: data.duration,
      total_price: data.totalPrice,
      final_price: data.finalPrice,
      status: 'pending'
    }]);

    if (dbError) {
      console.error("Booking Error:", dbError.message);
      return;
    }

    // 3. Instant Client Confirmation & Log (with limit check)
    if (confirmationsToday < 50 && canSendMessage('confirmation')) {
      await handleWhatsAppDispatch({
        type: 'instant',
        phone: data.clientPhone,
        content: `Confirmed! See you at ${salonProfile.name} on ${data.date} at ${data.startTime}`,
        salonId: salonProfile.id
      });
      
      // Log Success
      await supabase.from('activity_logs').insert([{
        salon_id: salonProfile.id,
        action_type: 'whatsapp_sent',
        details: `Confirmation sent to ${data.clientPhone}`,
        status: 'success'
      }]);
    } else {
      // Log Limit Warning
      await supabase.from('activity_logs').insert([{
        salon_id: salonProfile.id,
        action_type: 'limit_reached',
        details: `Limit Reached (50): Client Confirmation blocked`,
        status: 'warning'
      }]);
    }

    // 4. Instant Artist Notification & Log (with limit check)
    const artist = staff.find((s: any) => s.id === data.staffId);
    if (artist?.is_artist) {
      if (staffAlertsToday < 50 && canSendMessage('staff_alert')) {
        await handleWhatsAppDispatch({
          type: 'instant',
          phone: artist.phone,
          content: `Artist Alert: New booking for ${data.date} at ${data.startTime}`,
          salonId: salonProfile.id
        });

        await supabase.from('activity_logs').insert([{
          salon_id: salonProfile.id,
          action_type: 'whatsapp_sent',
          details: `Artist Alert sent to ${artist.name}`,
          status: 'success'
        }]);
      } else {
        await supabase.from('activity_logs').insert([{
          salon_id: salonProfile.id,
          action_type: 'limit_reached',
          details: `Limit Reached (50): Staff Alert blocked`,
          status: 'warning'
        }]);
      }
    }

    // 5. Refresh Data
    await get().fetchData(salonProfile.id);
  },

  updateBookingStatus: async (id, status) => {
    const { salonProfile } = get();
    await supabase.from('bookings').update({ status }).eq('id', id);
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  addGiftCard: async (data) => {
    const { salonProfile } = get();
    await supabase.from('gift_cards').insert([data]);
    if (salonProfile) get().fetchData(salonProfile.id);
  },

  getTodayBookings: () => {
    const { bookings, salonProfile } = get();
    if (!salonProfile) return [];
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(b => {
      const localDate = fromUTC(b.appointment_time, salonProfile.timezone).toFormat('yyyy-MM-dd');
      return localDate === today;
    });
  }
}));