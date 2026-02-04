import { useState, useEffect } from 'react';
import { 
  Save, Globe, DollarSign, Percent, Building 
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData'; // ✅ Added

export default function BookingSettingPage() {
  const { currentUser } = useStore();
  const { salonProfile, updateProfile } = useBookingStore();
  const { loading } = useFetchDashboardData('booking'); // ✅ Added - replaces manual fetch
  
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Data is fetched automatically by useFetchDashboardData
  // ❌ Removed manual fetchData useEffect

  useEffect(() => {
    if (salonProfile) setFormData(salonProfile);
  }, [salonProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile(formData);
    setIsSaving(false);
  };

  // ✅ Uses loading from master hook instead of local state
  if (loading || !formData) return <div className="p-10 text-center">Loading Settings... ⚙️</div>;

  return (
    <div className="max-w-4xl space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Salon Settings</h2>
        <p className="text-gray-500">Configure your business identity and regional rules</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 🏢 Brand Identity */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Building className="text-gray-400" size={20}/> Brand Identity
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Salon Name</label>
              <input 
                className="w-full border-b py-2 outline-none focus:border-indigo-500" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Brand Color</label>
              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="color" 
                  className="h-8 w-8 rounded cursor-pointer" 
                  value={formData.brand_color} 
                  onChange={e => setFormData({...formData, brand_color: e.target.value})} 
                />
                <span className="font-mono text-sm text-gray-500">{formData.brand_color}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🌍 Localization & Currency */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Globe className="text-gray-400" size={20}/> Regional Settings
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Currency Symbol</label>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-gray-300"/>
                <input 
                  className="w-full border-b py-2 outline-none" 
                  value={formData.currency} 
                  onChange={e => setFormData({...formData, currency: e.target.value})} 
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Timezone</label>
              <select 
                className="w-full border-b py-2 outline-none bg-transparent"
                value={formData.timezone}
                onChange={e => setFormData({...formData, timezone: e.target.value})}
              >
                <option value="Asia/Karachi">Pakistan (Karachi)</option>
                <option value="Asia/Dubai">UAE (Dubai)</option>
                <option value="Europe/Istanbul">Turkey (Istanbul)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 📊 Tax & Billing */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Percent className="text-gray-400" size={20}/> Billing & Tax
          </h3>
          <div className="max-w-xs">
            <label className="text-xs font-bold text-gray-400 uppercase">Tax Percentage (%)</label>
            <input 
              type="number"
              className="w-full border-b py-2 outline-none" 
              value={formData.tax_percent} 
              onChange={e => setFormData({...formData, tax_percent: Number(e.target.value)})} 
            />
            <p className="text-[10px] text-gray-400 mt-2 italic">This will be added to the final price of every booking.</p>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="fixed bottom-8 right-8 flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold shadow-2xl transition-transform active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: formData.brand_color }}
        >
          <Save size={20}/> {isSaving ? 'Saving...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
}