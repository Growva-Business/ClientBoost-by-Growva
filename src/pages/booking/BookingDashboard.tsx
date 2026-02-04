import { 
  Calendar, DollarSign, Clock, CheckCircle, AlertCircle, 
  Scissors, ChevronRight, Check, X, TrendingUp
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';

export default function BookingDashboard() {
  const { loading: isLoading } = useFetchDashboardData('booking'); // ✅ Master hook handles all fetching
  
  const { currentUser } = useStore();
  const { 
    salonProfile, 
    getTodayBookings, 
    dailyLimits, 
    updateBookingStatus
  } = useBookingStore();

  // ❌ REMOVED: Manual fetching useEffect and useRef
  // Data is now automatically fetched by useFetchDashboardData

  if (isLoading || !salonProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-bold italic tracking-wide">Opening the salon doors... 🔑</p>
      </div>
    );
  }

  const todayBookings = getTodayBookings();
  const revenue = todayBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.total_price || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* 🌟 Welcome Banner */}
      <div 
        className="rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${salonProfile.brand_color || '#4f46e5'}, #1e1b4b)` }}
      >
        <div className="relative z-10 space-y-3">
          <h2 className="text-5xl font-black tracking-tighter">{salonProfile.name} ✂️</h2>
          <p className="text-xl opacity-80 font-bold">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
        </div>
        <Calendar className="absolute right-[-20px] bottom-[-20px] h-72 w-72 opacity-10 rotate-12" />
      </div>

      {/* 📊 Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Total" value={todayBookings.length} icon={Calendar} color="bg-blue-600" />
        <StatCard title="Confirmed" value={todayBookings.filter(b => b.status === 'confirmed').length} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Waitlist" value={todayBookings.filter(b => b.status === 'pending').length} icon={Clock} color="bg-orange-500" />
        <StatCard title="Daily Revenue" value={`${salonProfile.currency} ${revenue}`} icon={DollarSign} color="bg-indigo-600" />
      </div>

      {/* 📅 Daily Schedule Timeline */}
      <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {todayBookings.map((booking) => (
            <div key={booking.id} className="p-8 flex items-center justify-between hover:bg-indigo-50/20">
              <div className="flex items-center gap-10">
                <div className="text-center min-w-[90px] py-3 px-4 bg-white rounded-2xl border-2 border-gray-100">
                  <p className="text-2xl font-black text-gray-900 leading-none">{booking.start_time}</p>
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900">{booking.clients?.name || 'Walk-in'}</p>
                  <span className="text-sm font-black text-indigo-600 uppercase">Artist: {booking.staff?.name}</span>
                </div>
              </div>

              {/* 🔘 Buttons call updateBookingStatus */}
              <div className="flex items-center gap-4">
                {booking.status === 'confirmed' && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="h-14 w-14 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-md"
                    >
                      <Check size={24} />
                    </button>
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="h-14 w-14 flex items-center justify-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-md"
                    >
                      <X size={24} />
                    </button>
                  </div>
                )}
                <span className="font-black text-xs uppercase opacity-50">{booking.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 shadow-sm flex items-center gap-6">
      <div className={cn("p-5 rounded-[1.5rem] text-white shadow-xl", color)}>
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900">{value}</p>
        <p className="text-[11px] text-gray-400 uppercase font-black">{title}</p>
      </div>
    </div>
  );
}