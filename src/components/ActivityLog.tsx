import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { useTranslation } from 'react-i18next';
import { Bell, ShieldAlert, CheckCircle2, Clock, Loader2 } from 'lucide-react';

interface ActivityLogProps {
  salonId?: string;
}

interface AuditLog {
  id: string;
  salon_id?: string;
  action: string;
  details: string;
  category?: string;
  created_at: string;
  // Add other fields as needed
}

export const ActivityLog = ({ salonId }: ActivityLogProps) => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedSalonId = useRef<string | undefined>(salonId);
  const isMounted = useRef(true);

  useEffect(() => {
    if (!isMounted.current) return;


    // 🔧 Fetch Logs Logic
    const fetchLogs = async () => {
      // 🛡️ Prevent fetching if already loading or same salonId
      if (loading) return;


      setLoading(true);
      setError(null);
      lastFetchedSalonId.current = salonId;

      try {
        let query = supabase
          .from('audit_logs')
          .select('*')
          .limit(50)

          .order('created_at', { ascending: false });

        // Only apply the salon_id filter if it's provided and not 'global'
        if (salonId && salonId !== 'global') {
          query = query.eq('salon_id', salonId);
        }

        const { data, error: fetchError } = await query.limit(10);

        if (fetchError) {
          throw fetchError;
        }

        if (isMounted.current) {
          setLogs(data || []);
        }
      } catch (err: any) {
        console.error("Audit log fetch error:", err.message);
        if (isMounted.current) {
          setError(err.message || 'Failed to fetch activity logs');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchLogs();

    // 🔧 Real-time Subscription with proper cleanup
    let channel: any = null;

    const setupSubscription = () => {
      channel = supabase
        .channel(`activity-updates-${salonId || 'global'}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        },
          (payload) => {
            // If we are in a specific salon view, only add if it matches
            if (!salonId || salonId === 'global' || payload.new.salon_id === salonId) {
              setLogs((prev) => {
                const newLog = payload.new as AuditLog;
                // Prevent duplicates
                if (prev.some(log => log.id === newLog.id)) {
                  return prev;
                }
                return [newLog, ...prev.slice(0, 9)]; // Keep only last 10
              });
            }
          })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Subscribed to audit logs for salon: ${salonId || 'global'}`);
          }
          if (status === 'CHANNEL_ERROR') {
            console.error('❌ Failed to subscribe to audit logs');
          }
        });
    };

    setupSubscription();

    // 🧹 Cleanup function
    return () => {
      isMounted.current = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [salonId]); // Only re-run when salonId changes

  // 🔧 Format date helper
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 🔧 Format action text
  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // 🔧 Get icon based on category or action
  const getIcon = (log: AuditLog) => {
    if (log.category === 'billing') {
      return <ShieldAlert size={16} />;
    }
    if (log.action === 'salon_created') {
      return <CheckCircle2 size={16} />;
    }
    return <Clock size={16} />;
  };

  // 🔧 Get icon color class
  const getIconColor = (log: AuditLog) => {
    if (log.category === 'billing') {
      return 'bg-amber-100 text-amber-600';
    }
    if (log.action === 'salon_created') {
      return 'bg-green-100 text-green-600';
    }
    return 'bg-indigo-100 text-indigo-600';
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black flex items-center gap-2 text-gray-900">
          <Bell className="text-indigo-600" size={20} />
          {t('dashboard.live_activity') || 'Live Activity'}
        </h3>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          Error: {error}
        </div>
      )}

      <div className="space-y-4">
        {loading && logs.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-400 font-bold text-center py-10 italic">
            No activity recorded yet.
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100"
            >
              <div className={`p-2 rounded-xl ${getIconColor(log)}`}>
                {getIcon(log)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {formatAction(log.action)}
                </p>
                <p className="text-xs text-gray-500 font-medium truncate">
                  {log.details}
                </p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                  {formatTime(log.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Optional: Add a refresh button */}
      {!loading && logs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              lastFetchedSalonId.current = undefined;
              setLogs([]);
            }}
            className="text-xs text-gray-500 hover:text-indigo-600 font-medium"
          >
            Clear & Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;