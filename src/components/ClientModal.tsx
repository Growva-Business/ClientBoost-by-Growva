import { useState } from 'react';
import { X, User, Phone, Mail, Save } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';

interface ClientModalProps {
  onClose: () => void;
  client?: any; // If provided, we are editing
}

export function ClientModal({ onClose, client }: ClientModalProps) {
  const { salonProfile, addClient, updateClient } = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    loyalty_points: client?.loyalty_points || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonProfile) return;
    
    setIsSubmitting(true);
    if (client) {
      await updateClient(client.id, formData);
    } else {
      await addClient({ ...formData, salon_id: salonProfile.id });
    }
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">{client ? 'Edit Client' : 'New Client'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
              <input 
                required 
                className="w-full pl-10 border-b py-2 outline-none focus:border-indigo-500" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                <input 
                  required 
                  className="w-full pl-10 border-b py-2 outline-none focus:border-indigo-500" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Email (Optional)</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                <input 
                  type="email"
                  className="w-full pl-10 border-b py-2 outline-none focus:border-indigo-500" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: salonProfile?.brand_color }}
          >
            <Save className="inline mr-2" size={18}/> {isSubmitting ? 'Saving...' : 'Save Client'}
          </button>
        </form>
      </div>
    </div>
  );
}