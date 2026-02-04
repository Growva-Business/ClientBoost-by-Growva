import { useState } from 'react';
import { 
  Settings, Save, Shield, Info, 
  Zap, Award, Crown, RefreshCcw 
} from 'lucide-react';
import { useStore } from '@/store/useStore'; // ✅ Added for language/RTL support
import { useMarketingStore } from '@/store/useMarketingStore';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';   

export default function MarketingSettingsPage() {
  // ✅ Master hook handles data orchestration for marketing settings
  useFetchDashboardData('marketing'); 

  const { language } = useStore(); // ✅ Added for RTL/LTR support
  const { clientTypeThresholds, updateThresholds } = useMarketingStore();
  const { salonProfile } = useBookingStore();
  
  const [thresholds, setThresholds] = useState(clientTypeThresholds);
  const [isSaving, setIsSaving] = useState(false);

  const isRTL = language === 'ar';

  // ❌ REMOVED: Any manual useEffect hooks for fetching thresholds

  const handleSave = async () => {
    setIsSaving(true);
    await updateThresholds(thresholds);
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl space-y-6 text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Settings className="text-rose-600" /> Marketing Settings
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Configure logic & automated segments
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white transition-all shadow-lg",
            isSaving 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-gray-900 hover:bg-black shadow-gray-200 hover:shadow-xl active:scale-95"
          )}
        >
          {isSaving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tier Thresholds Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
            <Award className="text-rose-600" size={20} />
            <h3 className="font-black text-gray-900 uppercase tracking-tight">Client Tier Thresholds</h3>
          </div>

          <p className="text-xs text-gray-500 font-medium">
            Define the minimum total spend ({salonProfile?.currency || '$'}) required for each client segment.
          </p>

          <div className="space-y-4">
            {/* Regular Member Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Zap size={12} className="text-green-500" /> Regular Member
              </label>
              <input 
                type="number"
                value={thresholds.regular}
                onChange={(e) => setThresholds({ ...thresholds, regular: parseInt(e.target.value) || 0 })}
                className={cn(
                  "w-full rounded-xl border border-gray-100 bg-gray-50 p-3 font-bold outline-none focus:ring-2 ring-rose-100 transition-all",
                  isRTL && "text-right"
                )}
              />
            </div>

            {/* Premium Member Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Award size={12} className="text-blue-500" /> Premium Member
              </label>
              <input 
                type="number"
                value={thresholds.premium}
                onChange={(e) => setThresholds({ ...thresholds, premium: parseInt(e.target.value) || 0 })}
                className={cn(
                  "w-full rounded-xl border border-gray-100 bg-gray-50 p-3 font-bold outline-none focus:ring-2 ring-rose-100 transition-all",
                  isRTL && "text-right"
                )}
              />
            </div>

            {/* VIP Member Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Crown size={12} className="text-purple-500" /> VIP Member
              </label>
              <input 
                type="number"
                value={thresholds.vip}
                onChange={(e) => setThresholds({ ...thresholds, vip: parseInt(e.target.value) || 0 })}
                className={cn(
                  "w-full rounded-xl border border-gray-100 bg-gray-50 p-3 font-bold outline-none focus:ring-2 ring-rose-100 transition-all",
                  isRTL && "text-right"
                )}
              />
            </div>
          </div>
        </div>

        {/* Info/Guide Card */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-gray-900 p-6 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-rose-500" size={20} />
              <h3 className="font-black uppercase tracking-widest text-xs">How it works</h3>
            </div>
            <ul className="space-y-4 text-sm font-medium text-gray-400">
              <li className="flex gap-3">
                <span className="text-rose-500 font-black">01</span>
                Clients are automatically categorized based on their total lifetime spend.
              </li>
              <li className="flex gap-3">
                <span className="text-rose-500 font-black">02</span>
                Segments allow you to send targeted WhatsApp campaigns (e.g., "VIP Only Deals").
              </li>
              <li className="flex gap-3">
                <span className="text-rose-500 font-black">03</span>
                Changes to thresholds will update all client badges instantly.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-200 p-6 flex items-start gap-4">
            <Shield className="text-gray-300 shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-sm text-gray-900">Marketing Compliance</h4>
              <p className="text-xs text-gray-500 mt-1">
                All automated messaging respects the "Opt-In" status defined in the Client Manager. Only clients with a verified shield badge will receive campaigns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}