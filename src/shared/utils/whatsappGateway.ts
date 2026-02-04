import { supabase } from '../lib/supabase';

// Use assistant's version - it's cleaner
export const handleWhatsAppDispatch = async (payload: {
  type: 'instant' | 'marketing' | 'reminder' | 'staff_alert' | 'confirmation',
  phone: string,
  content: string,
  salonId: string,
  bookingId?: string,
  ebookUrl?: string
}) => {
  try {
    const { data, error } = await supabase.rpc(
      'enqueue_or_manual_message_final',  // ✅ Use FINAL version
      {
        p_salon_id: payload.salonId,
        p_phone: payload.phone,
        p_content: payload.content,
        p_type: payload.type === 'instant' ? 'confirmation' : payload.type
      }
    );

    if (error || data?.error) {
      throw new Error(data?.message || error?.message);
    }

    if (data.method === 'manual') {
      // ✅ Proper encoding in frontend
      const whatsappUrl = `https://wa.me/${data.phone}?text=${encodeURIComponent(data.content)}`;

      return {
        method: 'manual',
        manualUrl: whatsappUrl,
        messageId: data.message_id
      };
    }

    return {
      method: 'queued',
      scheduledFor: data.scheduled_for,
      queueId: data.queue_id
    };

  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    console.error('WhatsApp dispatch failed:', errorMessage);
    
    // Emergency fallback
    const whatsappUrl = `https://wa.me/${payload.phone}?text=${encodeURIComponent(payload.content)}`;
    
    return {
      success: false,
      method: 'fallback',
      manualUrl: whatsappUrl,
      error: errorMessage
    };
  }
};

// Keep artist notification
export const notifyArtistOfBooking = async (booking: any, staff: any, salonId: string) => {
  if (!staff?.phone) return;
  
  const message = `*ARTIST ALERT*%0A%0AHi ${staff.name}, new booking!%0A📅 ${booking.date}%0A⏰ ${booking.start_time}%0A👤 ${booking.client_name || 'New Client'}`;
  
  return await handleWhatsAppDispatch({
    type: 'staff_alert',
    phone: staff.phone,
    content: message,
    salonId
  });
};
