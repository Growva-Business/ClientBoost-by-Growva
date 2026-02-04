import { useState, useEffect, useRef } from 'react'; // ✅ Added useRef
import { 
  ClipboardList, Search, User, Store, DollarSign, Settings, Activity 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/localization/translations';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';
export default function Logs() {
    useFetchDashboardData('admin'); // ✅ Add this

  const { language, auditLogs, fetchAuditLogs, loading } = useStore(); // ✅ Added loading
  const t = (key: string) => getTranslation(language, key);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter] = useState<string>('all');

  // ✅ Safety lock to prevent multiple fetches
  const lastFetchTime = useRef<number>(0);
  const isFetching = useRef<boolean>(false);

  useEffect(() => {
    // ✅ Prevent fetching if already loading or recently fetched
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    
    if (isFetching.current || timeSinceLastFetch < 5000) { // 5 second cooldown
      console.log("⏸️ Logs: Throttling fetch, last fetch was", Math.floor(timeSinceLastFetch / 1000), "seconds ago");
      return;
    }

    console.log("📡 Logs: Fetching audit logs...");
    isFetching.current = true;
    lastFetchTime.current = now;
    
    fetchAuditLogs().finally(() => {
      isFetching.current = false;
    });
  }, [fetchAuditLogs]);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    
    let matchesDate = true;
    const logDate = new Date(log.created_at); 
    if (dateFilter === 'today') {
      matchesDate = logDate >= today;
    } else if (dateFilter === 'week') {
      matchesDate = logDate >= weekAgo;
    } else if (dateFilter === 'month') {
      matchesDate = logDate >= monthAgo;
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return User;
      case 'salon': return Store;
      case 'billing': return DollarSign;
      case 'settings': return Settings;
      case 'api': return Activity;
      default: return ClipboardList;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth': return 'bg-blue-100 text-blue-600';
      case 'salon': return 'bg-indigo-100 text-indigo-600';
      case 'billing': return 'bg-green-100 text-green-600';
      case 'settings': return 'bg-amber-100 text-amber-600';
      case 'api': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // ✅ Show loading state
  if (loading && auditLogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('auditLogs')}</h2>

      <div className="flex flex-wrap gap-2">
        {['all', 'auth', 'salon', 'billing', 'settings', 'api'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border",
              categoryFilter === cat ? "bg-indigo-600 text-white" : "bg-white text-gray-600"
            )}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search the diary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm divide-y">
        {filteredLogs.map((log) => {
          const Icon = getCategoryIcon(log.category);
          return (
            <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", getCategoryColor(log.category))}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 uppercase text-xs">{log.action.replace('_', ' ')}</p>
                <p className="mt-1 text-sm text-gray-600">{log.details}</p>
                <p className="mt-1 text-[10px] text-indigo-500 font-black uppercase tracking-widest">
                  {log.category}
                </p>
              </div>
              <div className="text-right text-xs text-gray-400">
                <p className="font-medium text-gray-600">{format(new Date(log.created_at), 'MMM d, yyyy')}</p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLogs.length === 0 && !loading && (
        <div className="rounded-xl border bg-white py-12 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">No audit logs found</p>
        </div>
      )}
    </div>
  );
}