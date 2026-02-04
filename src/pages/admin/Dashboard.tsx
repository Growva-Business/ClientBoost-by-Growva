import { useMemo } from 'react';
import { 
  Store, DollarSign, TrendingUp, Clock, Users,  
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/localization/translations';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';
import { Salon, Invoice } from '@/types';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';  
/**
 * 📊 THE COMMAND CENTER (Safe Version)
 * No more useEffect here! The Layout handles the fetching.
 */
export default function Dashboard() {
    useFetchDashboardData('admin'); // ✅ Add this
  const { language, salons, invoices, auditLogs, loading } = useStore();
  const t = (key: string) => getTranslation(language, key);

  // --- 🛡️ CALCULATED TOTALS (Safe & Memoized) ---
  const totalRevenue = useMemo(() => {
    return invoices
      .filter((inv: Invoice) => inv.status === 'paid')
      .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  }, [invoices]);

  const activeSalonsCount = useMemo(() => {
    return salons.filter((s: Salon) => s.status === 'active').length;
  }, [salons]);

  const pendingPayments = useMemo(() => {
    return invoices.filter((inv: Invoice) => inv.status === 'pending').length;
  }, [invoices]);

  const statCards = [
    { title: t('totalSalons'), value: salons.length, icon: Store, color: 'bg-blue-500' },
    { title: t('activeSalons'), value: activeSalonsCount, icon: Users, color: 'bg-green-500' },
    { title: t('totalRevenue'), value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-indigo-500' },
    { title: t('pendingPayments'), value: pendingPayments, icon: Clock, color: 'bg-amber-500' },
  ];

  // Show a clean skeleton or message if the very first load is happening
  if (loading && salons.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-gray-400 uppercase tracking-widest">Syncing Empire Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-[2.5rem] bg-indigo-600 p-10 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter">Hello, Chief! 👑</h2>
          <p className="mt-2 text-indigo-100 font-bold opacity-90">Your salon empire is stable and secured.</p>
        </div>
        <TrendingUp className="absolute right-[-20px] bottom-[-20px] h-64 w-64 opacity-10 -rotate-12" />
      </div>

      {/* 📊 Live Stat Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div key={index} className="rounded-[2rem] border-2 border-gray-50 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("rounded-2xl p-4 text-white shadow-lg", stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Newest Shops List */}
        <div className="rounded-[2.5rem] border-2 border-gray-50 bg-white shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b-2 border-gray-50 flex justify-between items-center">
            <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest">Newest Shops 🏠</h3>
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black">LIVE</span>
          </div>
          <div className="divide-y-2 divide-gray-50">
            {salons.slice(0, 5).map((salon) => (
              <div key={salon.id} className="flex items-center justify-between px-8 py-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn("h-3 w-3 rounded-full", salon.status === 'active' ? "bg-green-500" : "bg-red-500")} />
                  <p className="font-black text-gray-800">{salon.name}</p>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase">{salon.package}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="rounded-[2.5rem] border-2 border-gray-50 bg-white shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b-2 border-gray-50">
            <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest">Recent Activity 🕵️‍♀️</h3>
          </div>
          <div className="divide-y-2 divide-gray-50">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="px-8 py-5 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-tighter">
                    {log.action.replace('_', ' ')}
                  </p>
                  <p className="text-[10px] text-gray-300 font-bold uppercase">
                    {format(new Date(log.created_at), 'HH:mm')}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-500 leading-tight">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}