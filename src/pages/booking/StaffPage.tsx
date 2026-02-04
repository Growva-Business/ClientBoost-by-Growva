import { useState } from 'react';
import { 
  Plus, Edit2, Mail, Phone, Percent, X, Shield, ShieldOff, Search, Trash2, Users // ✅ FIXED: Added Users import
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn'; 
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultWorkingHours = daysOfWeek.map((day, index) => ({
  day,
  is_working: index !== 0 && index !== 6, 
  start_time: '09:00',
  end_time: '18:00',
}));

export default function StaffPage() {
  // ✅ Master hook handles all data orchestration for the booking section
  useFetchDashboardData('booking'); 
  
  const { language } = useStore(); 
  const { 
    salonProfile, staff, addStaff, updateStaff, deleteStaff 
  } = useBookingStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commission_percent: 20,
    is_active: true,
    working_hours: defaultWorkingHours
  });

  const isRTL = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salonProfile) {
      await addStaff({ ...formData, salon_id: salonProfile.id });
      setIsModalOpen(false);
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        commission_percent: 20, 
        is_active: true, 
        working_hours: defaultWorkingHours 
      });
    }
  };

  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!salonProfile) return (
    <div className="p-10 text-center font-black text-gray-400 uppercase tracking-widest">
      Loading Team... 👥
    </div>
  );

  return (
    <div className="space-y-6 text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={cn(isRTL && "text-right")}>
          <h2 className="text-2xl font-black text-gray-900">Staff & Artists</h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Manage your team and commissions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white shadow-lg transition-all active:scale-95"
          style={{ backgroundColor: salonProfile.brand_color }}
        >
          <Plus size={18} /> Add Member
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md group">
        <Search className={cn(
          "absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors",
          isRTL ? "right-4" : "left-4"
        )} size={18} />
        <input 
          type="text"
          placeholder="Search team members..."
          className={cn(
            "w-full rounded-2xl border-2 border-gray-50 bg-white py-3 font-bold shadow-sm outline-none transition-all focus:border-indigo-600",
            isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4"
          )}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Staff Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStaff.map((member: any) => (
          <div key={member.id} className={cn(
            "bg-white border border-gray-100 rounded-3xl p-6 shadow-sm transition-all hover:shadow-md relative overflow-hidden",
            !member.is_active && "opacity-60"
          )}>
            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: salonProfile.brand_color }} />
            
            <div className={cn("absolute top-6", isRTL ? "left-6" : "right-6")}>
               <span className={cn(
                 "flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm",
                 member.is_active 
                   ? "bg-green-50 text-green-600 border-green-100" 
                   : "bg-gray-50 text-gray-400 border-gray-100"
               )}>
                 {member.is_active ? <Shield size={10}/> : <ShieldOff size={10}/>}
                 {member.is_active ? 'Active' : 'Inactive'}
               </span>
            </div>

            <div className="pt-4">
              <div className="flex justify-between items-start">
                <div 
                  className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner" 
                  style={{ backgroundColor: salonProfile.brand_color }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => updateStaff(member.id, { is_active: !member.is_active })} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <Edit2 size={16} className="text-gray-400" />
                  </button>
                  <button onClick={() => deleteStaff(member.id)} className="p-2 hover:bg-rose-50 rounded-xl transition-colors">
                    <Trash2 size={16} className="text-rose-400" />
                  </button>
                </div>
              </div>

              <h3 className="mt-5 font-black text-lg text-gray-900 leading-tight">{member.name}</h3>
              
              <div className="mt-4 space-y-3 border-t border-gray-50 pt-4">
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                  <Mail size={14} className="text-gray-300" /> 
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                  <Phone size={14} className="text-gray-300" /> 
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-black text-indigo-600 pt-1">
                  <Percent size={14} /> 
                  <span>{member.commission_percent}% Payout</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State - Now correctly finds 'Users' icon */}
      {filteredStaff.length === 0 && (
        <div className="py-24 text-center border-4 border-dashed border-gray-50 rounded-[2.5rem] bg-white/50">
          <Users size={48} className="mx-auto text-gray-100 mb-4" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No team members found</p>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">Add Team Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    required 
                    className={cn(
                      "w-full border-b-2 py-3 outline-none focus:border-indigo-600 font-bold transition-all bg-transparent",
                      isRTL && "text-right"
                    )} 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className={cn(
                      "w-full border-b-2 py-3 outline-none focus:border-indigo-600 font-bold transition-all bg-transparent",
                      isRTL && "text-right"
                    )} 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    className={cn(
                      "w-full border-b-2 py-3 outline-none focus:border-indigo-600 font-bold transition-all bg-transparent",
                      isRTL && "text-right"
                    )} 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Commission Percentage (%)</label>
                  <input 
                    type="number" 
                    required 
                    className={cn(
                      "w-full border-b-2 py-3 outline-none focus:border-indigo-600 font-bold transition-all bg-transparent",
                      isRTL && "text-right"
                    )} 
                    value={formData.commission_percent} 
                    onChange={e => setFormData({...formData, commission_percent: Number(e.target.value)})} 
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-400 font-black uppercase text-xs hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 rounded-2xl text-white font-black uppercase text-xs shadow-lg transition-all active:scale-95" 
                  style={{ backgroundColor: salonProfile.brand_color }}
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}