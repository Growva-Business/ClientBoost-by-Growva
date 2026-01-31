import { useState, useEffect } from 'react';
import { 
  Star, 
  Gift,
  Users,
  TrendingUp,
  Save,
  Check
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';

export function LoyaltyPage() {
  const { salonProfile, loyaltySettings, clients, updateLoyaltySettings } = useBookingStore();
  
  // Initialize state with fallback to avoid null errors
  const [settings, setSettings] = useState(loyaltySettings);
  const [saved, setSaved] = useState(false);

  // Sync local state when store data loads
  useEffect(() => {
    if (loyaltySettings) setSettings(loyaltySettings);
  }, [loyaltySettings]);

  if (!salonProfile || !settings) {
    return <div className="p-10 text-center">Loading Loyalty Settings... ⭐️</div>;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loyalty Program</h2>
          <p className="text-gray-500">Configure points and rewards for your customers</p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors",
            saved ? "bg-green-600" : "hover:opacity-90"
          )}
          style={!saved ? { backgroundColor: salonProfile.brand_color } : {}}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Points</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgPoints}</p>
              <p className="text-sm text-gray-500">Avg Points/Client</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter(c => (c.loyalty_points || 0) >= (loyaltySettings?.points_to_redeem || 0)).length}
              </p>
              <p className="text-sm text-gray-500">Ready to Redeem</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Gift className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {salonProfile.currency} {Math.floor(totalPoints / (loyaltySettings?.points_to_redeem || 1)) * (loyaltySettings?.redeem_value || 0)}
              </p>
              <p className="text-sm text-gray-500">Potential Rewards</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h3 className="font-semibold text-gray-900">Loyalty Settings</h3>
          </div>
          <div className="p-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Enable Loyalty Program</p>
                <p className="text-sm text-gray-500">Customers earn points for visits and spending</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            {settings.enabled && (
              <>
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-4">Points by Visit</h4>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Points earned per visit</label>
                    <input
                      type="number"
                      min="0"
                      value={settings.points_per_visit || 0}
                      onChange={(e) => setSettings({ ...settings, points_per_visit: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-4">Points by Spending</h4>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Points per {salonProfile.currency} 1 spent</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={settings.points_per_spend || 0}
                      onChange={(e) => setSettings({ ...settings, points_per_spend: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-4">Redemption</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">Points needed to redeem</label>
                      <input
                        type="number"
                        min="1"
                        value={settings.points_to_redeem || 1}
                        onChange={(e) => setSettings({ ...settings, points_to_redeem: parseInt(e.target.value) || 1 })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">Reward value ({salonProfile.currency})</label>
                      <input
                        type="number"
                        min="0"
                        value={settings.redeem_value || 0}
                        onChange={(e) => setSettings({ ...settings, redeem_value: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 font-bold">
                    Example: {settings.points_to_redeem} points = {salonProfile.currency} {settings.redeem_value} discount
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h3 className="font-semibold text-gray-900">Top Loyalty Members</h3>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {topClients.map((client, index) => (
              <div key={client.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white",
                      index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-gray-300"
                    )}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.total_visits} visits</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{client.loyalty_points} pts</p>
                  {(client.loyalty_points || 0) >= (loyaltySettings?.points_to_redeem || 0) && (
                    <span className="text-xs text-green-600 font-bold">Can redeem!</span>
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