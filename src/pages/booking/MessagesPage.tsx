import { useState } from 'react';
import { 
  MessageSquare, Bell, Send, ShieldCheck, 
  Settings, Zap, Clock, AlertTriangle, Check
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';

// We use the rules defined in your messageRules.ts
const MESSAGE_TYPES = [
  { id: 'confirmation', icon: Check, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'reminder', icon: Bell, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'promotion', icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'custom', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function MessagesPage() {
  // ✅ Master hook handles all data orchestration
  useFetchDashboardData('booking');

  const { language } = useStore();
  const { salonProfile } = useBookingStore();
  
  const [activeTab, setActiveTab] = useState('status');
  const isRTL = language === 'ar';

  // ❌ REMOVED: All manual useEffects or fetchData calls

  if (!salonProfile) return (
    <div className="p-10 text-center font-black text-gray-400 uppercase tracking-widest">
      Loading Communications... 📡
    </div>
  );

  return (
    <div className="space-y-6 text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={cn(isRTL && "text-right")}>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Send className="text-indigo-600" /> WhatsApp & SMS Center
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Automated Client Notifications & Daily Limits
          </p>
        </div>
        <div className="flex bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
          <button 
            onClick={() => setActiveTab('status')}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'status' ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-gray-900"
            )}
          >
            Today's Status
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'settings' ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-gray-900"
            )}
          >
            Rules & Timing
          </button>
        </div>
      </div>

      {activeTab === 'status' ? (
        <>
          {/* Daily Limits Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MESSAGE_TYPES.map((type) => (
              <div key={type.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("rounded-xl p-2.5", type.bg)}>
                    <type.icon size={20} className={type.color} />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase">Limit: 50/day</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{type.id}</h4>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-black text-gray-900">0</p>
                    <p className="text-xs font-bold text-gray-300 mb-1">Sent Today</p>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", type.id === 'confirmation' ? "bg-green-500" : "bg-indigo-500")} style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compliance & Security Banner */}
          <div className="rounded-2xl bg-indigo-900 p-6 text-white shadow-xl flex items-start gap-4">
            <div className="bg-white/10 p-3 rounded-xl">
              <ShieldCheck className="text-indigo-300" size={24} />
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest text-xs">Anti-Spam Compliance</h4>
              <p className="mt-1 text-sm font-medium text-indigo-100 opacity-80 leading-relaxed">
                Your messages are automatically throttled to ensure WhatsApp deliverability. Reminders are sent exactly 4 hours before the appointment to maximize attendance.
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Settings Section */
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {MESSAGE_TYPES.map((type) => (
              <div key={type.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("rounded-xl p-3", type.bg)}>
                    <type.icon size={24} className={type.color} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 capitalize">{type.id} Messages</h3>
                    <p className="text-xs font-bold text-gray-400">
                      {type.id === 'reminder' ? 'Sent 4 hours prior' : 'Sent automatically on trigger'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" defaultChecked className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-4">
             <div className="rounded-2xl border border-dashed border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="text-amber-500" size={18} />
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Timing Logic</h4>
                </div>
                <p className="text-xs font-bold text-gray-600 leading-relaxed">
                  Automated reminders check for new bookings every 15 minutes. Messages are queued to prevent simultaneous bursts.
                </p>
             </div>

             <div className="rounded-2xl bg-amber-50 border border-amber-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-amber-600" size={18} />
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-amber-600">Daily Quota</h4>
                </div>
                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                  Reached your limit? {salonProfile.package === 'pro' ? 'Contact support to increase your tier.' : 'Upgrade to Pro for higher message limits.'}
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}