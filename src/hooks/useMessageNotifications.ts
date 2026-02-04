import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { useBookingStore } from '@/store/useBookingStore';

export function useMessageNotifications() {
  const { salonProfile } = useBookingStore();
  const [dueMessages, setDueMessages] = useState<any[]>([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!salonProfile?.id || hasFetched.current) return;
    hasFetched.current = true;

    console.log('🔔 Setting up message listener for salon:', salonProfile.id);

    // Listen for new pending messages
    const channel = supabase
      .channel(`messages-${salonProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `salon_id=eq.${salonProfile.id}`,
        },
        (payload) => {
          const message = payload.new;
          if (message.status === 'pending') {
            console.log('📩 New pending message:', message.type);
            setDueMessages(prev => [...prev, message]);
          }
        }
      )
      .subscribe();

    // Initial fetch
    fetchDueMessages();

  return () => {
    supabase.removeChannel(channel);
  };
}, [salonProfile?.id]);

  const fetchDueMessages = async () => {
    if (!salonProfile?.id) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('salon_id', salonProfile.id)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(5);

    setDueMessages(data || []);
  };

  const markAsSent = async (messageId: string) => {
    if (!salonProfile?.id) return;

    await supabase
      .from('messages')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', messageId);

    setDueMessages(prev => prev.filter(m => m.id !== messageId));
  };

  return { dueMessages, fetchDueMessages, markAsSent };
}
