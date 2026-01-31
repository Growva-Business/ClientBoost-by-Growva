import { useEffect, useState } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { useTranslation } from 'react-i18next';
import { Bell, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

// 1. Defined an interface with an optional salonId (?) for Super Admin use
interface ActivityLogProps {
  salonId?: string; 
}

export const ActivityLog = ({ salonId }: ActivityLogProps) => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // 2. Fetch Logs Logic
    const fetchLogs = async () => {
      // Switched table name from 'activity_logs' to 'audit_logs' to match your schema
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Only apply the salon_id filter if it's provided and not 'global'
      if (salonId && salonId !== 'global') {
        query = query.eq('salon_id', salonId);
      }

      const { data, error } = await query.limit(10);
      
      if (error) {
        console.error("Audit log fetch error:", error.message);
      } else if (data) {
        setLogs(data);
      }
    };

    fetchLogs();

    // 3. Updated Real-time Subscription to watch 'audit_logs'
    const channel = supabase
      .channel('activity-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'audit_logs' 
      }, 
      (payload) => {
        // If we are in a specific salon view, only add if it matches
        if (!salonId || salonId === 'global' || payload.new.salon_id === salonId) {
          setLogs((prev) => [payload.new, ...prev].slice(0, 10));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [salonId]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm h-full">
      <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-gray-900">
        <Bell className="text-indigo-600" size={20} />
        {t('dashboard.live_activity') || 'Live Activity'}
      </h3>
      
      <div className="space-y-4">
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400 font-bold text-center py-10 italic">No activity recorded yet.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
              <div className={`p-2 rounded-xl ${
                log.category === 'billing' ? 'bg-amber-100 text-amber-600' : 
                log.action === 'salon_created' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {log.category === 'billing' ? <ShieldAlert size={16} /> : 
                 log.action === 'salon_created' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
              </div>
              <div className="flex-1">
                {/* Updated to use log.action or log.details based on your useStore.ts logAction */}
                <p className="text-sm font-bold text-gray-900 capitalize">
                  {log.action?.replace('_', ' ')}
                </p>
                <p className="text-xs text-gray-500 font-medium">{log.details}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                  {new Date(log.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};