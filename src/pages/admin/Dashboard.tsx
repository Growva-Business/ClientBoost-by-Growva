import { useEffect } from 'react';
import { 
  Store, DollarSign,TrendingUp, Clock, Users, Activity, MessageSquare  
} from 'lucide-react'; // 🧸 Cleaned unused icons
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/localization/translations';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';

/**
 * 📊 THE COMMAND CENTER
 * This is where the Big Boss sees the real live totals!
 */

export function Dashboard() {
  const { 
    language, 
    salons, 
    invoices, 
    auditLogs, 
    fetchSalons, 
    fetchInvoices, 
    fetchAuditLogs 
  } = useStore();
  

  const t = (key: string) => getTranslation(language, key);
  

  // 🚀 Fetch all data when the Big Boss arrives
  useEffect(() => {
    fetchSalons();
    fetchInvoices();
    fetchAuditLogs();
  }, [fetchSalons, fetchInvoices, fetchAuditLogs]);

  // 🧮 LIVE CALCULATIONS (No more mock data!)
  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingPayments = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;
  // ✨ Plug these in so the yellow lines disappear:
  const totalApiCalls = salons.reduce((sum, s) => sum + (s.api_usage?.used_today || 0), 0);
  const totalMessages = salons.reduce((sum, s) => sum + (s.message_stats?.today_sent || 0), 0);
  const statCards = [
    {
      title: t('totalSalons'),
      value: salons.length,
      icon: Store,
      color: 'bg-blue-500',
    },
    {
      title: t('activeSalons'),
      value: salons.filter(s => s.status === 'active').length,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: t('totalRevenue'),
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-indigo-500',
    },
    {
      title: t('pendingPayments'),
      value: pendingPayments,
      icon: Clock,
      color: 'bg-amber-500',
    },
    {
    title: "Live API Traffic", // ✨ New Card
    value: totalApiCalls.toLocaleString(),
    icon: Activity,
    color: 'bg-rose-500',
  },
  {
    title: "Messages Today", // ✨ New Card
    value: totalMessages.toLocaleString(),
    icon: MessageSquare,
    color: 'bg-purple-500',
  },
  ];

  const recentSalons = salons.slice(0, 5);
  const recentLogs = auditLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-indigo-600 p-8 text-white shadow-lg shadow-indigo-100">
        <h2 className="text-3xl font-bold">Hello, Chief! 👑</h2>
        <p className="mt-2 text-indigo-100 opacity-90">Your salon empire is growing beautifully today.</p>
      </div>

      {/* 📊 Live Stat Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div key={index} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={cn("rounded-lg p-3 text-white", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Shops List */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b px-6 py-4 bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Newest Shops 🏠</h3>
          </div>
          <div className="divide-y">
            {recentSalons.map((salon) => (
              <div key={salon.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="font-bold text-gray-700">{salon.name}</p>
                </div>
                <span className="text-xs font-bold text-gray-400">{salon.country_code}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b px-6 py-4 bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Recent Logs 🕵️‍♀️</h3>
          </div>
          <div className="divide-y">
            {recentLogs.map((log) => (
              <div key={log.id} className="px-6 py-4">
  <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">
    {log.action.replace('_', ' ')} {/* Matches 'action' in DB */}
  </p>
  <div className="flex justify-between mt-1">
    <p className="text-xs text-gray-500">{log.details}</p>
    <p className="text-[10px] text-gray-400 font-bold uppercase">
      {/* Use created_at from your DB verified query */}
      {format(new Date(log.created_at), 'HH:mm')}
    </p>
  </div>
</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}