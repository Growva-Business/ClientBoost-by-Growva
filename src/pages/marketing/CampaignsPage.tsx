import { useState, useMemo } from 'react';
import { 
  Megaphone, Target, Users, Calendar, 
  BarChart3, Plus, Search, Filter, 
  ChevronRight, MoreVertical 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useMarketingStore } from '@/store/useMarketingStore';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';

export default function CampaignsPage() {
  // ✅ Master hook handles all data orchestration for marketing
  useFetchDashboardData('marketing');

  const { language } = useStore();
  const { campaigns, getAnalytics } = useMarketingStore();
  const { salonProfile } = useBookingStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const analytics = getAnalytics();
  const isRTL = language === 'ar';

  // ✅ Cleaned memoized filtered campaigns to prevent re-renders
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [campaigns, searchQuery]);

  return (
    <div className="space-y-6 text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Megaphone className="text-rose-600" /> WhatsApp Campaigns
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {campaigns.length} total campaigns created
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-black transition-all active:scale-95">
          <Plus size={18} /> New Campaign
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Target size={18}/></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Now</p>
          </div>
          <p className="text-2xl font-black">{campaigns.filter(c => c.status === 'active').length}</p>
        </div>
        
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={18}/></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Targeted</p>
          </div>
          <p className="text-2xl font-black">{analytics.total_active_clients}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><BarChart3 size={18}/></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Retention Rate</p>
          </div>
          <p className="text-2xl font-black">{analytics.retention_rate}%</p>
        </div>
      </div>

      {/* Search Bar - RTL Compatible */}
      <div className="relative group">
        <Search className={cn(
          "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors",
          isRTL ? "right-4" : "left-4"
        )} />
        <input 
          type="text" 
          placeholder="Search campaigns..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full rounded-xl border border-gray-100 bg-white py-4 text-sm font-bold shadow-sm outline-none transition-all focus:ring-2 focus:ring-rose-100",
            isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4"
          )}
        />
      </div>

      {/* Campaigns Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Megaphone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{campaign.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={12} className="text-gray-400" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'Draft'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn(
                  "rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-tighter",
                  campaign.status === 'active' 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  {campaign.status}
                </span>
                <button className="p-1 hover:bg-gray-50 rounded-lg text-gray-400">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Campaign Stats Matrix */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Targeted</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-black text-gray-900">{campaign.target_clients.length}</p>
                  <Users size={12} className="text-gray-300" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivered</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-black text-indigo-600">{campaign.messages_delivered}</p>
                  <div className="h-1 w-1 rounded-full bg-indigo-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Failure</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-black text-rose-600">
                    {Math.max(0, campaign.messages_sent - campaign.messages_delivered)}
                  </p>
                  <div className="h-1 w-1 rounded-full bg-rose-600" />
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-3 rounded-xl bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2">
              View Detailed Analytics <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Empty State Illustration */}
      {filteredCampaigns.length === 0 && (
        <div className="py-24 text-center border-4 border-dashed border-gray-50 rounded-[2rem] bg-white/50">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Megaphone className="h-10 w-10 text-gray-200" />
          </div>
          <h3 className="text-lg font-black text-gray-900">No campaigns found</h3>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
            Try adjusting your search or create a new campaign
          </p>
        </div>
      )}
    </div>
  );
}