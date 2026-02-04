// pages/admin/ApiUsage.tsx (or wherever your ApiUsage component is)
import { useState, useMemo } from 'react'; // ❌ Remove useEffect import
import { 
  Activity, 
  MessageSquare, 
  Mail, 
  Phone,
  Search,
  Filter,
  Zap,
  AlertTriangle,
  Store
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/localization/translations';
import { getCountryByCode } from '@/data/countries';
import { cn } from '@/shared/utils/cn';
import { Salon, Country } from '@/types';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';

export default function ApiUsage() {
  useFetchDashboardData('admin'); // ✅ Master hook handles fetching
  
  const { language, salons, loading } = useStore(); // ❌ Remove fetchSalons
  const t = (key: string) => getTranslation(language, key);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'usage' | 'messages' | 'name'>('usage');
  
  // ❌ REMOVE THIS ENTIRE useEffect BLOCK:
  // useEffect(() => {
  //   if (fetchSalons && (!salons || salons.length === 0)) {
  //     fetchSalons();
  //   }
  // }, [fetchSalons, salons]);

  // ✅ Fixed with proper typing using your Salon type
  const { 
    totalApiCalls, 
    totalApiToday, 
    totalMessages, 
    totalMessagesToday,
    totalWhatsApp,
    totalSms,
    totalEmail 
  } = useMemo(() => {
    if (!salons || salons.length === 0) {
      return {
        totalApiCalls: 0,
        totalApiToday: 0,
        totalMessages: 0,
        totalMessagesToday: 0,
        totalWhatsApp: 0,
        totalSms: 0,
        totalEmail: 0
      };
    }
    
    return {
      totalApiCalls: salons.reduce((sum: number, s: Salon) => 
        sum + (s.api_usage?.total_calls || 0), 0),
      
      totalApiToday: salons.reduce((sum: number, s: Salon) => 
        sum + (s.api_usage?.used_today || 0), 0),
      
      totalMessages: salons.reduce((sum: number, s: Salon) => 
        sum + (s.message_stats?.total_sent || 0), 0),
      
      totalMessagesToday: salons.reduce((sum: number, s: Salon) => 
        sum + (s.message_stats?.today_sent || 0), 0),
      
      totalWhatsApp: salons.reduce((sum: number, s: Salon) => 
        sum + (s.message_stats?.whatsapp_sent || 0), 0),
      
      totalSms: salons.reduce((sum: number, s: Salon) => 
        sum + (s.message_stats?.sms_sent || 0), 0),
      
      totalEmail: salons.reduce((sum: number, s: Salon) => 
        sum + (s.message_stats?.email_sent || 0), 0)
    };
  }, [salons]);

  // ✅ Fixed filteredSalons with proper typing
  const filteredSalons = useMemo(() => {
    if (!salons) return [];
    
    const filtered = salons.filter((salon: Salon) => 
      salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort logic updated for snake_case
    return filtered.sort((a: Salon, b: Salon) => {
      if (sortBy === 'usage') return (b.api_usage?.used_today || 0) - (a.api_usage?.used_today || 0);
      if (sortBy === 'messages') return (b.message_stats?.today_sent || 0) - (a.message_stats?.today_sent || 0);
      return a.name.localeCompare(b.name);
    });
  }, [salons, searchQuery, sortBy]);

  const getUsagePercentage = (used: number, limit: number) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const stats = useMemo(() => [
    {
      title: 'Total API Calls',
      value: totalApiCalls.toLocaleString(),
      subValue: `${totalApiToday.toLocaleString()} today`,
      icon: Activity,
      color: 'bg-indigo-500',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Total Messages',
      value: totalMessages.toLocaleString(),
      subValue: `${totalMessagesToday.toLocaleString()} today`,
      icon: MessageSquare,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'WhatsApp Sent',
      value: totalWhatsApp.toLocaleString(),
      subValue: `${totalMessages > 0 ? Math.round((totalWhatsApp / totalMessages) * 100) : 0}% of total`,
      icon: Phone,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'SMS Sent',
      value: totalSms.toLocaleString(),
      subValue: `${totalMessages > 0 ? Math.round((totalSms / totalMessages) * 100) : 0}% of total`,
      icon: MessageSquare,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Emails Sent',
      value: totalEmail.toLocaleString(),
      subValue: `${totalMessages > 0 ? Math.round((totalEmail / totalMessages) * 100) : 0}% of total`,
      icon: Mail,
      color: 'bg-rose-500',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-600',
    },
  ], [totalApiCalls, totalApiToday, totalMessages, totalMessagesToday, totalWhatsApp, totalSms, totalEmail]);

  if (loading && (!salons || salons.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading API usage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('apiUsage')}</h2>
        <p className="text-gray-500">Monitor API calls and message usage per salon</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={cn("rounded-lg p-2", stat.bgLight)}>
                  <Icon className={cn("h-5 w-5", stat.textColor)} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.title}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">{stat.subValue}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`${t('search')} salons...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'usage' | 'messages' | 'name')}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="usage">Sort by API Usage</option>
            <option value="messages">Sort by Messages</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Salon usage cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredSalons.map((salon: Salon) => {
          const country: Country | undefined = getCountryByCode(salon.country_code);
          const apiPercentage = getUsagePercentage(
            salon.api_usage?.used_today || 0, 
            salon.api_usage?.daily_limit || 1
          );
          const msgPercentage = getUsagePercentage(
            salon.message_stats?.today_sent || 0, 
            salon.message_stats?.daily_limit || 1
          );
          
          return (
            <div key={salon.id} className="rounded-xl border bg-white shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                    <Store className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{salon.name}</h3>
                    <p className="text-sm text-gray-500">{country?.name} • {salon.package}</p>
                  </div>
                </div>
                {(apiPercentage >= 90 || msgPercentage >= 90) && (
                  <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    High Usage
                  </div>
                )}
              </div>

              {/* Usage stats */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* API Usage */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">API Calls</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {salon.api_usage?.used_today || 0}/{salon.api_usage?.daily_limit || 0}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn("h-full rounded-full transition-all", getUsageColor(apiPercentage))}
                        style={{ width: `${apiPercentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Total: {(salon.api_usage?.total_calls || 0).toLocaleString()}
                    </p>
                  </div>

                  {/* Message Usage */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Messages</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {salon.message_stats?.today_sent || 0}/{salon.message_stats?.daily_limit || 0}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn("h-full rounded-full transition-all", getUsageColor(msgPercentage))}
                        style={{ width: `${msgPercentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Total: {(salon.message_stats?.total_sent || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Message breakdown */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-500">WhatsApp</span>
                    </div>
                    <p className="mt-1 font-semibold text-gray-900">
                      {(salon.message_stats?.whatsapp_sent || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-xs text-gray-500">SMS</span>
                    </div>
                    <p className="mt-1 font-semibold text-gray-900">
                      {(salon.message_stats?.sms_sent || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                      <span className="text-xs text-gray500">Email</span>
                    </div>
                    <p className="mt-1 font-semibold text-gray-900">
                      {(salon.message_stats?.email_sent || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSalons.length === 0 && !loading && (
        <div className="rounded-xl border bg-white py-12 text-center">
          <Activity className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">{t('noData')}</p>
        </div>
      )}
    </div>
  );
}