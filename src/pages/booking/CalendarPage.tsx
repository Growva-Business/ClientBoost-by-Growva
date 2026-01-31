import { useState, useEffect } from 'react';
import { 
  Plus, X, Clock // 🧸 Kept only Clock for the "Empty" state
} from 'lucide-react'; 
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn';
import { fromUTC } from '@/shared/utils/date-logic';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { BookingStatus } from '@/types';

export function CalendarPage() {
  const { currentUser } = useStore();
  const { 
    salonProfile, bookings, services, fetchData, addBooking 
  } = useBookingStore();

  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '', clientPhone: '', serviceId: '', time: '09:00'
  });
  
  useEffect(() => {
    if (currentUser?.salon_id) fetchData(currentUser.salon_id);
  }, [currentUser, fetchData]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate), i));
  
  // 🧸 Error Fix 7: Using 'todayBookings' in the JSX below
  const todayBookings = bookings.filter(b => {
    if (!salonProfile) return false;
    return fromUTC(b.appointment_time, salonProfile.timezone).toFormat('yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  });

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === formData.serviceId);
    
    await addBooking({
      ...formData,
      date: format(selectedDate, 'yyyy-MM-dd'),
      // 🧸 Error Fix 1: Changing back to 'duration' to match your Service type
      duration: (service as any)?.duration || 30, 
      totalPrice: service?.price || 0,
      finalPrice: service?.price || 0,
    });
    setIsModalOpen(false);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 border-green-300 text-green-800';
      case 'pending': return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'completed': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  if (!salonProfile) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-lg text-white font-bold" 
          style={{ backgroundColor: salonProfile.brand_color }}
        >
          <Plus size={18} className="inline mr-2"/> New Appointment
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <button 
            key={day.toISOString()} 
            onClick={() => setSelectedDate(day)} 
            className={cn("rounded-xl border p-4 bg-white", isSameDay(day, selectedDate) && "ring-2")} 
            // 🧸 Error Fix 2: Changed 'ringColor' to 'boxShadow'
            style={isSameDay(day, selectedDate) ? { boxShadow: `0 0 0 2px ${salonProfile.brand_color}` } : {}}
          >
            <p className="text-xs text-gray-400 font-bold uppercase">{format(day, 'EEE')}</p>
            <p className="text-xl font-black">{format(day, 'd')}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="font-bold text-gray-900">{format(selectedDate, 'EEEE, MMMM do')}</h3>
        </div>
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {/* 🧸 'todayBookings' is now being read here */}
          {todayBookings.length === 0 ? (
            <div className="py-20 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-200 mb-2" />
              <p className="text-gray-400">No appointments scheduled.</p>
            </div>
          ) : (
            todayBookings.map((booking) => {
              const localTime = fromUTC(booking.appointment_time, salonProfile.timezone).toFormat('hh:mm a');
              return (
                <div key={booking.id} className="flex items-center justify-between px-6 py-5">
                  <div className="flex items-center gap-6">
                    <p className="text-lg font-black text-gray-900">{localTime}</p>
                    <div className="h-10 w-1 rounded-full" style={{ backgroundColor: salonProfile.brand_color }} />
                    <p className="font-bold text-gray-900">{booking.clients?.name || 'Walk-in'}</p>
                  </div>
                  <span className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase border", getStatusColor(booking.status))}>
                    {booking.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">New Appointment</h3>
              <button onClick={() => setIsModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <input required className="w-full border-b py-2 outline-none" placeholder="Client Name" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              <input required className="w-full border-b py-2 outline-none" placeholder="Phone" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} />
              <select required className="w-full border-b py-2 outline-none bg-transparent" value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})}>
                <option value="">Select Service</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button type="submit" className="w-full py-4 rounded-xl text-white font-bold" style={{ backgroundColor: salonProfile.brand_color }}>Book Now</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

