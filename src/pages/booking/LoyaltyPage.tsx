import { useState, useEffect } from 'react';
import { 
  Star, 
  Gift,
  Users,
  TrendingUp,
  Save,
  Check
} from 'lucide-react';
import { useStore } from '@/store/useStore'; // ✅ Added for language/RTL support
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';

export default function LoyaltyPage() {
  // ✅ Master hook handles all data orchestration for the loyalty program
  useFetchDashboardData('booking'); 

  const { language } = useStore(); // ✅ Support for RTL/LTR layouts
  const { salonProfile, loyaltySettings, clients, updateLoyaltySettings } = useBookingStore();
  
  // Initialize state with fallback to avoid null errors
  const [settings, setSettings] = useState(loyaltySettings);
  const [saved, setSaved] = useState(false);

  const isRTL = language === 'ar';

  // Sync local state when store data loads (State sync only, no fetching here)
  useEffect(() => {
    if (loyaltySettings) setSettings(loyaltySettings);
  }, [loyaltySettings]);

  // ❌ REMOVED: Any redundant useEffect hooks that were manually calling fetchData

  if (!salonProfile || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400 font-black uppercase tracking-widest text-xs">
            Loading Loyalty Settings... ⭐️
          </p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    updateLoyaltySettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Fixed property names to use snake_case
  const topClients = [...clients]
    .sort((a, b) => (b.loyalty_points || 0) - (a.loyalty_points || 0))
    .slice(0, 10);

  const totalPoints = clients.reduce((sum, c) => sum + (c.loyalty_points || 0), 0);
  const avgPoints = clients.length > 0 ? Math.round(totalPoints / clients.length) : 0;

  return (
    <div className="space-y-6 text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={cn(isRTL && "text-right")}>
          <h2 className="text-2xl font-black text-gray-900">Loyalty Program</h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Configure points and rewards for your customers
          </p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white transition-all shadow-lg active:scale-95",
            saved ? "bg-green-600 shadow-green-100" : "shadow-indigo-100 hover:opacity-90"
          )}
          style={!saved ? { backgroundColor: salonProfile.brand_color } : {}}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Changes Saved!' : 'Save Configuration'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        {/* Total Points */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-yellow-50 p-2.5">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{totalPoints.toLocaleString()}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Points</p>
            </div>
          </div>
        </div>

        {/* Avg Points */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 p-2.5">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{avgPoints}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Points/Client</p>
            </div>
          </div>
        </div>

        {/* Ready to Redeem */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-2.5">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">
                {clients.filter(c => (c.loyalty_points || 0) >= (loyaltySettings?.points_to_redeem || 0)).length}
              </p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ready to Redeem</p>
            </div>
          </div>
        </div>

        {/* Potential Rewards */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5">
              <Gift className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">
                {salonProfile.currency} {Math.floor(totalPoints / (loyaltySettings?.points_to_redeem || 1)) * (loyaltySettings?.redeem_value || 0)}
              </p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Potential Rewards</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Panel */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 px-6 py-5 bg-gray-50/50">
            <h3 className="font-black text-gray-900 uppercase tracking-tight">Program Configuration</h3>
          </div>
          <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Enable Loyalty Rewards</p>
                <p className="text-xs font-medium text-gray-400">Customers earn points for every visit and spend</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white shadow-inner"></div>
              </label>
            </div>

            {settings.enabled && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="border-t border-gray-50 pt-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Earning Rules</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500">Points per visit</label>
                      <input
                        type="number"
                        min="0"
                        value={settings.points_per_visit || 0}
                        onChange={(e) => setSettings({ ...settings, points_per_visit: parseInt(e.target.value) || 0 })}
                        className={cn(
                          "w-full rounded-xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3 font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all",
                          isRTL && "text-right"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500">Points per {salonProfile.currency} 1 spend</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={settings.points_per_spend || 0}
                        onChange={(e) => setSettings({ ...settings, points_per_spend: parseFloat(e.target.value) || 0 })}
                        className={cn(
                          "w-full rounded-xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3 font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all",
                          isRTL && "text-right"
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-50 pt-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Redemption Rules</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500">Points to redeem</label>
                      <input
                        type="number"
                        min="1"
                        value={settings.points_to_redeem || 1}
                        onChange={(e) => setSettings({ ...settings, points_to_redeem: parseInt(e.target.value) || 1 })}
                        className={cn(
                          "w-full rounded-xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3 font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all",
                          isRTL && "text-right"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500">Reward Value ({salonProfile.currency})</label>
                      <input
                        type="number"
                        min="0"
                        value={settings.redeem_value || 0}
                        onChange={(e) => setSettings({ ...settings, redeem_value: parseFloat(e.target.value) || 0 })}
                        className={cn(
                          "w-full rounded-xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3 font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all",
                          isRTL && "text-right"
                        )}
                      />
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl bg-indigo-50 p-4 border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-600 flex items-center gap-2">
                      <Gift size={14} />
                      Current Logic: {settings.points_to_redeem} pts = {salonProfile.currency} {settings.redeem_value} discount
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ranking List */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 px-6 py-5 bg-gray-50/50">
            <h3 className="font-black text-gray-900 uppercase tracking-tight">Loyalty Rankings</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto custom-scrollbar">
            {topClients.map((client, index) => (
              <div key={client.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm transition-transform group-hover:scale-110",
                      index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-gray-200"
                    )}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 leading-tight">{client.name}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{client.total_visits} visits</p>
                  </div>
                </div>
                <div className={cn("text-right", isRTL ? "text-left" : "text-right")}>
                  <p className="text-sm font-black text-indigo-600">{client.loyalty_points.toLocaleString()} pts</p>
                  {(client.loyalty_points || 0) >= (loyaltySettings?.points_to_redeem || 0) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-black uppercase text-green-600 tracking-tighter mt-1">
                      <Check size={8} /> Redeemable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}