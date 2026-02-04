// PHASE-1 WhatsApp Gateway
// ----------------------------------
// Rules:
// - NO RPC
// - NO auto queue
// - NO background sending
// - Manual WhatsApp (wa.me) only
// - Keep function signatures stable

// NOTE: Phase-2 logic (RPC / queue) will be re-added later

type WhatsAppPayload = {
  type: 'instant' | 'marketing' | 'reminder' | 'staff_alert' | 'confirmation';
  phone: string;
  content: string;
  salonId: string;
  bookingId?: string;
  ebookUrl?: string;
};

export const handleWhatsAppDispatch = async (payload: WhatsAppPayload) => {
  // Manual WhatsApp link only
  const manualUrl = `https://wa.me/${payload.phone}?text=${encodeURIComponent(
    payload.content
  )}`;

  return {
    method: 'manual',
    manualUrl,
    messageId: null, // Phase-1: no DB message tracking here
  };
};

// Keep artist notification helper (USED elsewhere)
export const notifyArtistOfBooking = async (
  booking: any,
  staff: any,
  salonId: string
) => {
  if (!staff?.phone) return null;

  const message =
    `*ARTIST ALERT*\n\n` +
    `Hi ${staff.name}, new booking!\n` +
    `📅 ${booking.date}\n` +
    `⏰ ${booking.start_time}\n` +
    `👤 ${booking.client_name || 'New Client'}`;

  return handleWhatsAppDispatch({
    type: 'staff_alert',
    phone: staff.phone,
    content: message,
    salonId,
  });
};
