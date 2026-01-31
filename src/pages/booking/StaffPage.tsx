import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Mail, Phone, Percent, X, Shield, ShieldOff 
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn'; // 🧸 Now being used below

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultWorkingHours = daysOfWeek.map((day, index) => ({
  day,
  is_working: index !== 0 && index !== 6, 
  start_time: '09:00',
  end_time: '18:00',
}));

export function StaffPage() {
  const { currentUser } = useStore();
  const { 
    salonProfile, staff, fetchData, addStaff, updateStaff, deleteStaff 
  } = useBookingStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commission_percent: 20,
    is_active: true,
    working_hours: defaultWorkingHours
  });

  useEffect(() => {
    if (currentUser?.salon_id) fetchData(currentUser.salon_id);
  }, [currentUser, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.salon_id) {
      await addStaff({ ...formData, salon_id: currentUser.salon_id });
      setIsModalOpen(false);
      setFormData({ ...formData, name: '', email: '', phone: '', commission_percent: 20, is_active: true, working_hours: defaultWorkingHours });
    }
  };

  if (!salonProfile) return <div className="p-10 text-center text-gray-400">Loading Team... 👥</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff & Artists</h2>
          <p className="text-gray-500">Manage your team and commissions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-md"
          style={{ backgroundColor: salonProfile.brand_color }}
        >
          <Plus size={18} /> Add Member
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((member: any) => (
          <div key={member.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm relative">
            <div className="h-2" style={{ backgroundColor: salonProfile.brand_color }} />
            
            {/* 🧸 Status Badge using 'cn' to clear the warning */}
            <div className="absolute top-4 right-16">
               <span className={cn(
                 "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border",
                 member.is_active 
                   ? "bg-green-50 text-green-600 border-green-100" 
                   : "bg-gray-50 text-gray-400 border-gray-100"
               )}>
                 {member.is_active ? <Shield size={10}/> : <ShieldOff size={10}/>}
                 {member.is_active ? 'Active' : 'Inactive'}
               </span>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: salonProfile.brand_color }}>
                  {member.name.charAt(0)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateStaff(member.id, { is_active: !member.is_active })} className="p-1 hover:bg-gray-100 rounded">
                    <Edit2 size={14} className="text-gray-400" />
                  </button>
                  <button onClick={() => deleteStaff(member.id)} className="p-1 hover:bg-red-50 rounded">
                    <X size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
              <h3 className="mt-4 font-bold text-lg text-gray-900">{member.name}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2"><Mail size={14}/> {member.email}</p>
                <p className="text-sm text-gray-500 flex items-center gap-2"><Phone size={14}/> {member.phone}</p>
                <p className="text-sm font-bold text-indigo-600 flex items-center gap-2"><Percent size={14}/> {member.commission_percent}% Commission</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal code remains the same as your snippet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Add Team Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400"><X/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                  <input required className="w-full border-b py-2 outline-none focus:border-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                  <input type="email" required className="w-full border-b py-2 outline-none focus:border-indigo-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Phone</label>
                  <input type="tel" required className="w-full border-b py-2 outline-none focus:border-indigo-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Commission %</label>
                  <input type="number" required className="w-full border-b py-2 outline-none focus:border-indigo-500" value={formData.commission_percent} onChange={e => setFormData({...formData, commission_percent: Number(e.target.value)})} />
                </div>
              </div>
              
              <button type="submit" className="w-full py-4 rounded-xl text-white font-bold shadow-lg mt-4" style={{ backgroundColor: salonProfile.brand_color }}>
                Save Staff Member
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}