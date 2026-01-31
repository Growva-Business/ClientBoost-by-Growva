import { 
  Users, TrendingUp, DollarSign, Repeat,
  UserPlus, Target, Megaphone, BarChart3 
} from 'lucide-react';
import { useMarketingStore } from '@/store/useMarketingStore';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';

export function MarketingDashboard() {
  const { clients, campaigns, getAnalytics } = useMarketingStore();
  const { salonProfile } = useBookingStore();
  const analytics = getAnalytics();

  // 1. Safety check for salonProfile to resolve "possibly null" errors
  if (!salonProfile) {
    return <div className="p-10 text-center">Loading Analytics... 📊</div>;
  }

  // 2. Updated property names to use snake_case as defined in types/index.ts
  const stats = [
    {
      title: 'Active Clients',
      value: analytics.total_active_clients, // Fixed
      icon: Users,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'New This Month',
      value: analytics.new_clients_this_month, // Fixed
      icon: UserPlus,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
      change: `+${analytics.client_growth}%`, // Fixed
    },
    {
      title: 'Avg. Spend',
      value: `${salonProfile.currency} ${analytics.avg_client_spend}`, // Fixed
      icon: DollarSign,
      color: 'bg-indigo-500',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Avg. Visits',
      value: analytics.avg_visit_frequency, // Fixed
      icon: Repeat,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Retention Rate',
      value: `${analytics.retention_rate}%`, // Fixed
      icon: Target,
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      title: 'Active Campaigns',
      value: campaigns.filter(c => c.status === 'active').length,
      icon: Megaphone,
      color: 'bg-rose-500',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-600',
    },
  ];

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
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 p-6 text-white">
        <h2 className="text-2xl font-bold">Marketing Dashboard 📊</h2>
        <p className="mt-1 opacity-90">Analyze your clients and grow your business</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className={cn("rounded-lg p-2", stat.bgLight)}>
                  <Icon className={cn("h-5 w-5", stat.textColor)} />
                </div>
                {stat.change && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client Distribution - Added types for 'item' */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4"><h3 className="font-semibold text-gray-900">Client Distribution</h3></div>
          <div className="p-5">
            <div className="space-y-4">
              {analytics.clients_by_type.map((item: { type: string, count: number }) => (
                <div key={item.type} className="flex items-center gap-4">
                  <div className="w-20">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium text-white capitalize", getClientTypeColor(item.type))}>
                      {item.type}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                      <div 
                        className={cn("h-full rounded-full", getClientTypeColor(item.type))}
                        style={{ width: `${(item.count / (clients.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className="font-semibold text-gray-900">{item.count}</span>
                    <span className="text-sm text-gray-500"> ({Math.round((item.count / (clients.length || 1)) * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Trend - Added types for 'item' and 'r' */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4"><h3 className="font-semibold text-gray-900">Revenue Trend</h3></div>
          <div className="p-5">
            <div className="flex items-end justify-between h-48 gap-4">
              {analytics.revenue_by_month.map((item: { month: string, revenue: number }, index: number) => {
                const maxRevenue = Math.max(...analytics.revenue_by_month.map((r: { revenue: number }) => r.revenue)) || 1;
                const height = (item.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex-1 w-full flex items-end">
                      <div className="w-full rounded-t-lg bg-gradient-to-t from-rose-500 to-pink-400" style={{ height: `${height}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{item.month}</span>
                    <span className="text-xs font-medium text-gray-700">{salonProfile.currency} {(item.revenue / 1000).toFixed(1)}k</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Services - Added types */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4"><h3 className="font-semibold text-gray-900">Top Services</h3></div>
          <div className="divide-y">
            {analytics.top_services.slice(0, 5).map((service: any, index: number) => (
              <div key={service.serviceId || index} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white", index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-gray-300")}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{service.serviceName}</p>
                    <p className="text-sm text-gray-500">{service.count} bookings</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{salonProfile.currency} {service.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Staff - Added types */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4"><h3 className="font-semibold text-gray-900">Top Staff Performance</h3></div>
          <div className="divide-y">
            {analytics.top_staff.map((staff: any, index: number) => (
              <div key={staff.staffId || index} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white", index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-gray-300")}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{staff.staffName}</p>
                    <p className="text-sm text-gray-500">{staff.bookings} bookings</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{salonProfile.currency} {staff.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Campaigns</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="divide-y">
          {campaigns.slice(0, 5).map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-gray-900">{campaign.name}</p>
                <p className="text-sm text-gray-500">{campaign.target_clients.length} clients targeted</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Sent / Delivered</p>
                  <p className="font-medium text-gray-900">{campaign.messages_sent} / {campaign.messages_delivered}</p>
                </div>
                <span className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  campaign.status === 'active' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                )}>
                  {campaign.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}