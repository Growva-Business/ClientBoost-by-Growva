import { useEffect } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
 
  Scissors, 
  ChevronRight, 
  Check, 
  X,
  TrendingUp
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';

export function BookingDashboard() {
  const { currentUser } = useStore();
  const { 
    salonProfile, 
    fetchData, 
    getTodayBookings, 
    dailyLimits, 
    updateBookingStatus 
  } = useBookingStore();

  useEffect(() => {
    if (currentUser?.salon_id) {
      fetchData(currentUser.salon_id);
    }
  }, [currentUser, fetchData]);

  if (!salonProfile) {
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
        style={{ 
          background: `linear-gradient(135deg, ${salonProfile.brand_color || '#4f46e5'}, #1e1b4b)`,
        }}
      >
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-white/20">
            <TrendingUp size={14} /> 
            <span>Live Salon Pulse</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-white">
            {salonProfile.name} ✂️
          </h2>
          <p className="text-xl opacity-80 font-bold text-white">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>
        
        <Calendar className="absolute right-[-20px] bottom-[-20px] h-72 w-72 opacity-10 rotate-12 text-white" />
      </div>

      {/* 📊 Key Statistics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Total" value={todayBookings.length} icon={Calendar} color="bg-blue-600" />
        <StatCard title="Confirmed" value={todayBookings.filter(b => b.status === 'confirmed').length} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Waitlist" value={todayBookings.filter(b => b.status === 'pending').length} icon={Clock} color="bg-orange-500" />
        <StatCard title="Daily Revenue" value={`${salonProfile.currency} ${revenue}`} icon={DollarSign} color="bg-indigo-600" />
      </div>

      {/* ⚠️ Quota Warning */}
      {dailyLimits && (dailyLimits.used_confirmation + dailyLimits.used_reminder + dailyLimits.used_promotion) >= 80 && (
        <div className="flex items-center justify-between p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] text-red-700 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="bg-red-100 p-3 rounded-2xl animate-pulse">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black leading-tight">Message Quota Alert</p>
              <p className="text-sm font-medium opacity-80">You have used over 80% of your daily WhatsApp limit.</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors">
            Upgrade Plan
          </button>
        </div>
      )}

      {/* 📅 Daily Schedule Timeline */}
      <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div>
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
              <Clock className="text-indigo-600" size={28}/> Daily Schedule
            </h3>
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Manage your artists & floor</p>
          </div>
          <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-black text-gray-400">{todayBookings.length}</span>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {todayBookings.length === 0 ? (
            <div className="p-32 text-center space-y-4">
              <div className="bg-gray-50 h-24 w-24 rounded-[2rem] flex items-center justify-center mx-auto border-4 border-white shadow-inner">
                <Calendar className="text-gray-200" size={40} />
              </div>
              <div>
                <p className="text-xl font-black text-gray-900">Quiet day so far!</p>
                <p className="text-gray-400 font-medium">Any new bookings will appear here instantly.</p>
              </div>
            </div>
          ) : (
            todayBookings.sort((a,b) => a.start_time.localeCompare(b.start_time)).map((booking) => (
              <div key={booking.id} className={cn(
                "p-8 flex items-center justify-between transition-all duration-300 group hover:bg-indigo-50/20",
                booking.status === 'cancelled' && "opacity-40 grayscale pointer-events-none"
              )}>
                <div className="flex items-center gap-10">
                  <div className="text-center min-w-[90px] py-3 px-4 bg-white rounded-2xl border-2 border-gray-100 shadow-sm group-hover:border-indigo-100 transition-colors">
                    <p className="text-2xl font-black text-gray-900 leading-none">{booking.start_time}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">Arrival</p>
                  </div>

                  <div className="h-16 w-px bg-gray-100 hidden lg:block"></div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                      <p className="text-xl font-black text-gray-900">{booking.client?.name || 'Walk-in Client'}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                      <span className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                        <Scissors size={14} /> {booking.service?.name}
                      </span>
                      <span className="flex items-center gap-2 text-sm font-black text-indigo-600 uppercase tracking-tighter">
                        Artist: {booking.staff?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {booking.status === 'confirmed' && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="h-14 w-14 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-md border-2 border-emerald-100"
                      >
                        <Check size={24} />
                      </button>
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="h-14 w-14 flex items-center justify-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-md border-2 border-red-100"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  )}
                  {booking.status === 'completed' && (
                    <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.1em] border-2 border-emerald-200">
                      <CheckCircle size={16} /> Completed
                    </div>
                  )}
                  {booking.status === 'cancelled' && (
                    <div className="bg-gray-100 text-gray-500 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.1em]">
                      Cancelled
                    </div>
                  )}
                  <button className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white border-2 border-gray-100 text-gray-300 hover:text-indigo-600 transition-all shadow-sm">
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 shadow-sm flex items-center gap-6 group hover:shadow-2xl hover:translate-y-[-6px] transition-all duration-500">
      <div className={cn("p-5 rounded-[1.5rem] text-white shadow-xl transform transition-transform group-hover:scale-110 duration-700", color)}>
        <Icon className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{value}</p>
        <p className="text-[11px] text-gray-400 uppercase font-black tracking-[0.2em] leading-none mt-2">{title}</p>
      </div>
    </div>
  );
}