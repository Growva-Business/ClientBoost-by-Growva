import { 
  BarChart3, Users, TrendingUp, DollarSign, Repeat, 
  Target, Calendar, Scissors 
} from 'lucide-react';
import { useStore } from '@/store/useStore'; // ✅ Added for language/RTL support
import { useMarketingStore } from '@/store/useMarketingStore';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';   

export default function AnalyticsPage() {
  // ✅ Master hook handles data orchestration for the marketing dashboard
  useFetchDashboardData('marketing'); 
  
  const { language } = useStore(); // ✅ Added for RTL/LTR support
  const { getAnalytics, clients } = useMarketingStore();
  const { salonProfile } = useBookingStore();
  const analytics = getAnalytics();

  const isRTL = language === 'ar';

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case 'vip': return 'bg-purple-500';
      case 'premium': return 'bg-blue-500';
      case 'regular': return 'bg-green-500';
      case 'new': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6 text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <BarChart3 className="text-rose-600" /> Marketing Analytics
        </h2>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Growth & Performance Insights</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600"><Users size={20} /></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Clients</p>
          </div>
          <p className="text-2xl font-black">{analytics.total_active_clients}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-green-50 p-2 text-green-600"><TrendingUp size={20} /></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New / Month</p>
          </div>
          <p className="text-2xl font-black text-green-600">+{analytics.new_clients_this_month}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600"><DollarSign size={20} /></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Spend</p>
          </div>
          <p className="text-2xl font-black">
            {salonProfile?.currency || '$'} {analytics.avg_client_spend}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600"><Repeat size={20} /></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Frequency</p>
          </div>
          <p className="text-2xl font-black">{analytics.avg_visit_frequency}x</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600"><TrendingUp size={20} /></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth</p>
          </div>
          <p className="text-2xl font-black text-amber-600">+{analytics.client_growth}%</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600"><Target size={20} /></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Retention</p>
          </div>
          <p className="text-2xl font-black text-rose-600">{analytics.retention_rate}%</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart Section */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 px-6 py-5 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-black text-gray-900">Revenue Trends</h3>
            <DollarSign className="h-5 w-5 text-gray-300" />
          </div>
          <div className="p-8">
            <div className="flex items-end justify-between h-48 gap-4">
              {analytics.revenue_by_month.length > 0 ? analytics.revenue_by_month.map((item: any, index: number) => {
                const maxRevenue = Math.max(...analytics.revenue_by_month.map((r: any) => r.revenue)) || 1;
                const height = (item.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex-1 w-full flex items-end">
                      <div 
                        className="w-full rounded-t-lg bg-gradient-to-t from-rose-600 to-rose-400 transition-all hover:brightness-110 duration-700"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase">{item.month}</span>
                  </div>
                );
              }) : (
                <div className="w-full flex items-center justify-center text-gray-400 text-sm font-bold italic">
                  Collecting data for chart...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client Distribution Section */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 px-6 py-5 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-black text-gray-900">Segment Distribution</h3>
            <Users className="h-5 w-5 text-gray-300" />
          </div>
          <div className="p-8 space-y-6">
            {analytics.clients_by_type.map((item) => {
              const percentage = clients.length > 0 ? Math.round((item.count / clients.length) * 100) : 0;
              return (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-3 w-3 rounded-full", getClientTypeColor(item.type))} />
                      <span>{item.type}</span>
                    </div>
                    <span className="text-gray-900">{item.count} ({percentage}%)</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-50">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", getClientTypeColor(item.type))}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Tables */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 px-6 py-5 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-black text-gray-900">High-Value Services</h3>
            <Scissors className="h-5 w-5 text-gray-300" />
          </div>
          <div className="divide-y divide-gray-50">
            {analytics.top_services.length > 0 ? analytics.top_services.map((service: any, index: number) => (
              <div key={index} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-lg bg-gray-900 text-white text-[10px] font-black flex items-center justify-center">0{index + 1}</span>
                  <p className="font-bold text-sm">{service.serviceName}</p>
                </div>
                <p className={cn("font-black text-sm text-gray-900", isRTL ? "text-left" : "text-right")}>
                  {salonProfile?.currency || '$'} {service.revenue.toLocaleString()}
                </p>
              </div>
            )) : (
               <div className="p-8 text-center text-gray-400 text-sm italic font-bold">Waiting for more bookings...</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 px-6 py-5 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-black text-gray-900">Staff Performance</h3>
            <Calendar className="h-5 w-5 text-gray-300" />
          </div>
          <div className="divide-y divide-gray-50">
            {analytics.top_staff.length > 0 ? analytics.top_staff.map((staff: any, index: number) => (
              <div key={index} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-lg bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">0{index + 1}</span>
                  <p className="font-bold text-sm">{staff.staffName}</p>
                </div>
                <p className={cn("font-black text-sm text-gray-900", isRTL ? "text-left" : "text-right")}>
                  {salonProfile?.currency || '$'} {staff.revenue.toLocaleString()}
                </p>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-400 text-sm italic font-bold">Analyzing staff data...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}