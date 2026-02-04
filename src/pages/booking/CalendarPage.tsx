import { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, ChevronLeft, 
  ChevronRight, Plus, Search, Users 
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn';
import { format, startOfToday, addDays, isSameDay } from 'date-fns';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';

export default function CalendarPage() {
  // ✅ Master hook handles all data orchestration for the calendar
  useFetchDashboardData('booking');

  const { language } = useStore();
  const { salonProfile, bookings, staff } = useBookingStore();
  
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [searchQuery, setSearchQuery] = useState('');
  const isRTL = language === 'ar';

  // ✅ FIX: Changed 'b.services' to 'b.service' to match your Booking type
  const filteredBookings = bookings.filter(b => 
    isSameDay(new Date(b.appointment_time), selectedDate) &&
    (b.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     b.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!salonProfile) return (
    <div className="p-10 text-center font-black text-gray-400 uppercase tracking-widest">
      Syncing Calendar... 📅
    </div>
  );

  return (
    <div className="space-y-6 text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={cn(isRTL && "text-right")}>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <CalendarIcon className="text-indigo-600" /> Appointment Schedule
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {format(selectedDate, 'EEEE, MMMM do yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
           <button className="p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-all">
              <Search size={18} className="text-gray-400" />
           </button>
           <button 
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white shadow-lg transition-all active:scale-95" 
            style={{ backgroundColor: salonProfile.brand_color }}
          >
            <Plus size={18} /> New Booking
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Date Selection Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Jump to Date</h3>
               <div className="flex gap-1">
                  <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={16}/></button>
                  <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={16}/></button>
               </div>
            </div>
            <div className="space-y-2">
              {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                const date = addDays(startOfToday(), offset);
                const isSelected = isSameDay(date, selectedDate);
                return (
                  <button
                    key={offset}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-all font-black text-sm",
                      isSelected 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                        : "bg-gray-50 text-gray-400 hover:bg-white hover:shadow-md"
                    )}
                  >
                    <span>{format(date, 'EEE, MMM d')}</span>
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl">
             <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-indigo-400" />
                <h4 className="font-black text-[10px] uppercase tracking-widest opacity-60">Staff on Duty</h4>
             </div>
             <div className="space-y-3">
                {staff.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-[10px]">{s.name[0]}</div>
                    <span className="text-xs font-bold">{s.name}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Appointment Feed */}
        <div className="lg:col-span-3 space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-gray-50 text-indigo-600 border border-gray-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Clock size={20} />
                    <span className="text-xs font-black mt-1">
                      {format(new Date(booking.appointment_time), 'HH:mm')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900">{booking.clients?.name || 'Guest'}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {/* ✅ FIX: Changed 'booking.services' to 'booking.service' */}
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{booking.service?.name}</span>
                      <div className="h-1 w-1 rounded-full bg-gray-200" />
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{booking.staff?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={cn(isRTL ? "text-left" : "text-right")}>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Total Price</p>
                    {/* ✅ FIX: Changed 'booking.services' to 'booking.service' */}
                    <p className="font-black text-gray-900">{salonProfile.currency} {booking.service?.price || 0}</p>
                  </div>
                  <div className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm",
                    booking.status === 'confirmed' ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                  )}>
                    {booking.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 text-center border-4 border-dashed border-gray-50 rounded-[3rem] bg-white/50">
               <CalendarIcon size={48} className="mx-auto text-gray-100 mb-4" />
               <h3 className="text-lg font-black text-gray-900">No Appointments</h3>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Quiet day! Use the time to run a campaign.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}