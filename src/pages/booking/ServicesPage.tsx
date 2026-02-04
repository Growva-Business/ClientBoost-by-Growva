import { useState } from 'react';
import { 
  Users, Plus, Mail, Phone, Edit2, 
  Trash2, Shield, X, Check, Search 
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';

export default function ServicesPage() {
  // ✅ Master hook handles all data orchestration for the staff section
  useFetchDashboardData('booking');

  const { language } = useStore();
  const { 
    salonProfile, staff, addStaff, updateStaff, deleteStaff 
  } = useBookingStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'stylist',
    is_active: true
  });

  const isRTL = language === 'ar';

  // ❌ REMOVED: Redundant fetchData logic or local useEffects

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonProfile) return;

    if (editingStaff) {
      await updateStaff(editingStaff.id, formData);
    } else {
      await addStaff({ ...formData, salon_id: salonProfile.id });
    }
    closeModal();
  };

  const openEditModal = (member: any) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      is_active: member.is_active
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormData({ name: '', email: '', phone: '', role: 'stylist', is_active: true });
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!salonProfile) return (
    <div className="p-10 text-center font-black text-gray-400 uppercase tracking-widest">
      Loading Team... 👥
    </div>
  );

  return (
    <div className="space-y-6 text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={cn(isRTL && "text-right")}>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="text-indigo-600" /> Staff Management
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Manage your team and permissions</p>
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
        {filteredStaff.map((member) => (
          <div key={member.id} className={cn(
            "bg-white border border-gray-100 rounded-3xl p-6 shadow-sm transition-all hover:shadow-md",
            !member.is_active && "opacity-60"
          )}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-100">
                  {member.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 leading-tight">{member.name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                    {member.role}
                  </span>
                </div>
              </div>
              <span className={cn(
                "h-2 w-2 rounded-full",
                member.is_active ? "bg-green-500" : "bg-gray-300"
              )} />
            </div>

            <div className="space-y-3 border-t border-gray-50 pt-6">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                <Mail size={16} className="text-gray-300" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                <Phone size={16} className="text-gray-300" />
                <span>{member.phone}</span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => openEditModal(member)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-100 text-xs font-black uppercase text-gray-400 hover:bg-gray-50 hover:text-indigo-600 transition-all"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button 
                onClick={() => deleteStaff(member.id)}
                className="p-2.5 rounded-xl border border-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <div className="py-24 text-center border-4 border-dashed border-gray-50 rounded-[2.5rem] bg-white/50">
          <Users size={48} className="mx-auto text-gray-100 mb-4" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No team members found</p>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">
                {editingStaff ? 'Edit Member' : 'New Member'}
              </h3>
              <button onClick={closeModal} className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input 
                  required 
                  className={cn(
                    "w-full border-b-2 py-3 outline-none focus:border-indigo-600 font-bold transition-all",
                    isRTL && "text-right"
                  )}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" required 
                  className={cn(
                    "w-full border-b-2 py-3 outline-none focus:border-indigo-600 font-bold transition-all",
                    isRTL && "text-right"
                  )}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                <input 
                  required 
                  className={cn(
                    "w-full border-b-2 py-3 outline-none focus:border-indigo-600 font-bold transition-all",
                    isRTL && "text-right"
                  )}
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div className="flex items-center justify-between py-4 border-y border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Status</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-400 font-black uppercase text-xs hover:bg-gray-100 transition-all">Cancel</button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 rounded-2xl text-white font-black uppercase text-xs shadow-lg transition-all active:scale-95" 
                  style={{ backgroundColor: salonProfile.brand_color }}
                >
                  {editingStaff ? 'Save Changes' : 'Invite Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}