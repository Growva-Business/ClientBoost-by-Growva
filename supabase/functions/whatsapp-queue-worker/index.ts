import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GATEWAY_URL = "https://your-android-gateway.com/send";
const GATEWAY_KEY = "YOUR_SECRET_API_KEY";

Deno.serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // 1. GATEKEEPER: Pick the oldest 'queued' message ready for dispatch
  const { data: message, error: fetchError } = await supabase
    .from('message_queue')
    .select(`
      *,
      messages (type)
    `)
    .eq('status', 'queued')
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(1)
    .single();

  if (fetchError || !message) {
    return new Response(JSON.stringify({ message: 'Queue empty or idle' }), { status: 200 });
  }

  // 2. LOCKING: Mark as 'processing' so no other worker picks it up
  await supabase.from('message_queue').update({ status: 'processing' }).eq('id', message.id);

  try {
    const today = new Date().toISOString().split('T')[0];
    const messageType = message.messages?.type || 'custom';
    const limitValue = 50; // Business Rule: 50/50/50/50 Strategy

    // 3. LIMIT CHECK: Verify daily quota before transmission
    const { data: limits } = await supabase
      .from('daily_message_limits')
      .select('*')
      .eq('salon_id', message.salon_id)
      .eq('date', today)
      .maybeSingle();

    const currentUsage = limits ? (limits[`used_${messageType}`] || 0) : 0;

    if (currentUsage >= limitValue) {
      await supabase.from('message_queue').update({ status: 'failed' }).eq('id', message.id);
      
      // Log limit violation to audit_logs (Standard naming)
      await supabase.from('audit_logs').insert({
        salon_id: message.salon_id,
        action: 'limit_reached',
        details: `Daily limit of ${limitValue} reached for ${messageType}. Message blocked.`,
        category: 'warning'
      });
      
      return new Response(JSON.stringify({ error: 'Daily quota exceeded' }), { status: 429 });
    }

    // 4. DISPATCH: Send to Android Gateway
    const response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_KEY}` 
      },
      body: JSON.stringify({ 
        to: message.recipient_phone, 
        msg: message.content,
        type: messageType 
      })
    });

    if (!response.ok) throw new Error(`Gateway returned ${response.status}`);

    // 5. SUCCESS WORKFLOW: Update counters and logs
    await supabase.rpc('increment_daily_limit', {
      p_salon_id: message.salon_id,
      p_date: today,
      p_type: messageType,
      p_amount: 1
    });

    // Record in messages table for history
    await supabase.from('messages').insert([{
      salon_id: message.salon_id,
      client_phone: message.recipient_phone,
      content: message.content,
      type: messageType,
      status: 'sent',
      sent_at: new Date().toISOString()
    }]);

    // Update Audit Log for Dashboard visibility
    await supabase.from('audit_logs').insert({
      salon_id: message.salon_id,
      action: 'whatsapp_sent',
      details: `Message successfully sent to ${message.recipient_phone}`,
      category: 'marketing'
    });

    // Clean up queue
    await supabase.from('message_queue').delete().eq('id', message.id);
    
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });

  } catch (err) {
    // 6. RETRY LOGIC: Handle failures with exponential backoff delay
    console.error('Transmission Error:', err.message);

    await supabase.from('message_queue').update({ 
      status: 'queued',
      retry_count: (message.retry_count || 0) + 1,
      scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString() 
    }).eq('id', message.id);
    
    await supabase.from('audit_logs').insert({
      salon_id: message.salon_id,
      action: 'message_retry',
      details: `Failed sending to ${message.recipient_phone}. Error: ${err.message}`,
      category: 'warning'
    });

    return new Response(JSON.stringify({ error: 'Retry scheduled' }), { status: 500 });
  }
});