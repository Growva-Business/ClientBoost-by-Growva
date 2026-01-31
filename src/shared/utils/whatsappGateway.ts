import { supabase } from '@/shared/lib/supabase'; //

/**
 * 1. The Core Dispatcher 
 * Handles the "Brain" of the sending: Instant vs Queued
 */
export const handleWhatsAppDispatch = async (payload: {
  type: 'instant' | 'marketing' | 'reminder' | 'staff_alert', // Added staff_alert for clarity
  phone: string,
  content: string,
  salonId: string
}) => {
  const GATEWAY_API_URL = "https://your-android-gateway.com/send";
  const GATEWAY_API_KEY = "YOUR_SECRET_API_KEY";

  // 1. Marketing Queue Logic (9-minute gap)
  if (payload.type === 'marketing') {
    return await supabase.from('message_queue').insert([{
      salon_id: payload.salonId,
      recipient_phone: payload.phone,
      content: payload.content,
      status: 'queued'
    }]);
  }

  // 2. Instant Logic (Confirmations & Staff Notifications)
  try {
    const response = await fetch(GATEWAY_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_API_KEY}` 
      },
      body: JSON.stringify({ to: payload.phone, msg: payload.content })
    });

    const result = await response.json();

    // ✨ IMPORTANT: Record the send in the 'messages' table so the 50/50 counter works!
  // Inside handleWhatsAppDispatch function, after response.ok

  
if (response.ok) {
  // Existing message record
  await supabase.from('messages').insert([{
    salon_id: payload.salonId,
    recipient_phone: payload.phone,
    content: payload.content,
    type: payload.type === 'instant' ? 'confirmation' : 'staff_alert', 
    status: 'sent'
  }]);

  // 🚀 ADD THIS: Record in audit_logs so it renders on the Dashboard
  await supabase.from('audit_logs').insert([{
    salon_id: payload.salonId,
    action: 'whatsapp_sent',
    details: `Message sent to ${payload.phone}`,
    category: 'api'
  }]);
}

    return result;
  } catch (error) {
    console.error("WhatsApp Gateway Error:", error);
    return { error: "Failed to connect to gateway" };
  }
};

/**
 * 2. The Artist Helper
 */
export const notifyArtistOfBooking = async (booking: any, staff: any, salonId: string) => {
  if (!staff.is_artist || !staff.phone) return;

  // Uses %0A for line breaks as per your gateway format
  const message = `*ARTIST ALERT*%0A%0A` +
    `Hi ${staff.name}, a new appointment is scheduled for you!%0A` +
    `📅 Date: ${booking.date}%0A` +
    `⏰ Time: ${booking.start_time}%0A` +
    `👤 Client: ${booking.client_name || 'New Client'}`;

  return await handleWhatsAppDispatch({
    type: 'staff_alert', // Specifically labeled for the 50-limit counter
    phone: staff.phone,
    content: message,
    salonId: salonId
  });
};