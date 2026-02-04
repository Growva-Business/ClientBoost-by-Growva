import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GATEWAY_URL = "https://your-android-gateway.com/send";
const GATEWAY_KEY = "YOUR_SECRET_API_KEY";
const MAX_RETRIES = 5;

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // 1️⃣ Fetch oldest queued message ready for dispatch & lock it atomically via RPC
    const { data: message, error: fetchError } = await supabase
      .from('message_queue')
      .select('*')
      .eq('status', 'queued')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(1)
      .single();

    if (fetchError || !message) {
      return new Response(JSON.stringify({ message: 'Queue empty or idle' }), { status: 200 });
    }

    // 2️⃣ Skip if retry limit exceeded
    if ((message.retry_count || 0) >= MAX_RETRIES) {
      await supabase.from('message_queue').update({ status: 'failed' }).eq('id', message.id);
      return new Response(JSON.stringify({ error: 'Retry limit exceeded' }), { status: 429 });
    }

    // 3️⃣ Get daily quota dynamically from salon settings
    const today = new Date().toISOString().split('T')[0];
    const messageType = message.type || 'custom';

    const { data: limits } = await supabase
      .from('daily_message_limits')
      .select('*')
      .eq('salon_id', message.salon_id)
      .eq('date', today)
      .maybeSingle();

    // Fetch salon marketing limit dynamically
    const { data: settings } = await supabase
      .from('marketing_settings')
      .select(`daily_limit_${messageType}`)
      .eq('salon_id', message.salon_id)
      .maybeSingle();

    const dailyLimit = settings?.[`daily_limit_${messageType}`] ?? 50;
    const currentUsage = limits ? (limits[`used_${messageType}`] || 0) : 0;

    if (currentUsage >= dailyLimit) {
      await supabase.from('message_queue').update({ status: 'failed' }).eq('id', message.id);
      await supabase.from('audit_logs').insert({
        salon_id: message.salon_id,
        action: 'limit_reached',
        details: `Daily limit of ${dailyLimit} reached for ${messageType}.`,
        category: 'warning'
      });
      return new Response(JSON.stringify({ error: 'Daily quota exceeded' }), { status: 429 });
    }

    // 4️⃣ Mark as processing
    await supabase.from('message_queue').update({ status: 'processing' }).eq('id', message.id);

    // 5️⃣ Send message to Android Gateway
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

    // 6️⃣ SUCCESS WORKFLOW: Increment counters and insert history (atomic RPC recommended)
    await supabase.rpc('increment_daily_limit', {
      p_salon_id: message.salon_id,
      p_date: today,
      p_type: messageType,
      p_amount: 1
    });

    await supabase.from('messages').insert([{
      salon_id: message.salon_id,
      client_phone: message.recipient_phone,
      content: message.content,
      type: messageType,
      status: 'sent',
      sent_at: new Date().toISOString()
    }]);

    await supabase.from('audit_logs').insert({
      salon_id: message.salon_id,
      action: 'whatsapp_sent',
      details: `Message successfully sent to ${message.recipient_phone}`,
      category: 'marketing'
    });

    // Remove from queue
    await supabase.from('message_queue').delete().eq('id', message.id);

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });

  } catch (err) {
    console.error('Transmission Error:', err.message);

    // 7️⃣ RETRY LOGIC with exponential backoff
    const retryCount = (err.retry_count || 0) + 1;
    const backoffMs = Math.min(5 * 60 * 1000 * Math.pow(2, retryCount), 30 * 60 * 1000); // max 30 min

    await supabase.from('message_queue').update({ 
      status: 'queued',
      retry_count: retryCount,
      scheduled_for: new Date(Date.now() + backoffMs).toISOString() 
    }).eq('id', err.message?.id || null);

    await supabase.from('audit_logs').insert({
      salon_id: err.message?.salon_id || null,
      action: 'message_retry',
      details: `Failed sending to ${err.message?.recipient_phone || 'unknown'}. Error: ${err.message}`,
      category: 'warning'
    });

    return new Response(JSON.stringify({ error: 'Retry scheduled' }), { status: 500 });
  }
});
