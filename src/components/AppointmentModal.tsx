import { useState } from 'react';
import { X, User, Scissors, UserCheck, Calendar, Clock, Save } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';

interface AppointmentModalProps {
  onClose: () => void;
  selectedDate?: Date;
}

export function AppointmentModal({ onClose, selectedDate }: AppointmentModalProps) {
  const { 
    salonProfile, clients, services, staff, addBooking 
  } = useBookingStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    staff_id: '',
    booking_date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    start_time: '10:00',
    status: 'confirmed' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonProfile) return;

    setIsSubmitting(true);
    // Find selected service to get price/duration for the booking record
    const service = services.find(s => s.id === formData.service_id);
    
    await addBooking({
      ...formData,
      salon_id: salonProfile.id,
      total_price: service?.price || 0,
      currency: salonProfile.currency
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900">New Appointment</h3>
            <p className="text-xs text-gray-500">Schedule a service for a client</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Client Selection */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Select Client</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
              <select 
                required
                className="w-full pl-10 border-b py-2 outline-none focus:border-indigo-500 bg-transparent"
                value={formData.client_id}
                onChange={e => setFormData({...formData, client_id: e.target.value})}
              >
                <option value="">Choose a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Service & Staff */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Service</label>
              <div className="relative mt-1">
                <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                <select 
                  required
                  className="w-full pl-10 border-b py-2 outline-none focus:border-indigo-500 bg-transparent"
                  value={formData.service_id}
                  onChange={e => setFormData({...formData, service_id: e.target.value})}
                >
                  <option value="">Select service...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} ({salonProfile?.currency}{s.price})</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Staff Member</label>
              <div className="relative mt-1">
                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                <select 
                  required
                  className="w-full pl-10 border-b py-2 outline-none focus:border-indigo-500 bg-transparent"
                  value={formData.staff_id}
                  onChange={e => setFormData({...formData, staff_id: e.target.value})}
                >
                  <option value="">Assign staff...</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Date</label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                <input 
                  type="date"
                  required
                  className="w-full pl-10 border-b py-2 outline-none"
                  value={formData.booking_date}
                  onChange={e => setFormData({...formData, booking_date: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Start Time</label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                <input 
                  type="time"
                  required
                  className="w-full pl-10 border-b py-2 outline-none"
                  value={formData.start_time}
                  onChange={e => setFormData({...formData, start_time: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl text-white font-bold shadow-lg mt-4 transition-transform active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: salonProfile?.brand_color }}
          >
            <Save className="inline mr-2" size={18}/> {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}