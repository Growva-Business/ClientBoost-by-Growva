import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Gift, Clock, DollarSign, X 
} from 'lucide-react'; // 🧸 Error Fix: Removed Search and Edit2
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn';

export function PackagesPage() {
  const { currentUser } = useStore();
  const { 
    packages, services, salonProfile, fetchData, addPackage, deletePackage 
  } = useBookingStore();

  // 🧸 Error Fix: Removed searchQuery state to clear yellow warnings
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    original_price: 0,
    discounted_price: 0, // 🎯 This is the correct name
    valid_days: 30,
    is_active: true,
    service_ids: [] as string[]
  });

  useEffect(() => {
    if (currentUser?.salon_id) fetchData(currentUser.salon_id);
  }, [currentUser, fetchData]);

  const handleServiceToggle = (id: string) => {
    const newIds = formData.service_ids.includes(id)
      ? formData.service_ids.filter(sid => sid !== id)
      : [...formData.service_ids, id];
    setFormData({ ...formData, service_ids: newIds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.salon_id) {
      await addPackage({ ...formData, salon_id: currentUser.salon_id });
      setIsModalOpen(false);
      setFormData({ 
        name: '', 
        description: '', 
        original_price: 0, 
        discounted_price: 0, 
        valid_days: 30, 
        is_active: true, 
        service_ids: [] 
      });
    }
  };

  if (!salonProfile) return <div className="p-10 text-center text-gray-400">Loading Bundles... 🎁</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Packages</h2>
          <p className="text-gray-500">Bundle services together for discounts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-transform active:scale-95"
          style={{ backgroundColor: salonProfile.brand_color }}
        >
          <Plus size={18} /> Add Package
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {packages.map((pkg: any) => (
          <div key={pkg.id} className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                  <Gift size={24} />
                </div>
                <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", pkg.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400")}>
                  {pkg.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <h3 className="mt-4 font-bold text-xl text-gray-900">{pkg.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
              
              <div className="mt-4 flex gap-4">
                <div className="flex items-center gap-1 text-sm font-bold text-indigo-600">
                  <DollarSign size={14}/> {pkg.discounted_price}
                  <span className="text-xs text-gray-300 line-through ml-1">{pkg.original_price}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock size={14}/> {pkg.valid_days} Days
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end gap-2">
              <button onClick={() => deletePackage(pkg.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Create New Package</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Package Name</label>
                <input required className="w-full border-b py-2 outline-none focus:border-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Original Price</label>
                  <input type="number" className="w-full border-b py-1 outline-none" value={formData.original_price} onChange={e => setFormData({...formData, original_price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Bundle Price</label>
                  {/* 🧸 Error Fix: Corrected 'discount_price' to 'discounted_price' */}
                  <input type="number" required className="w-full border-b py-1 outline-none focus:border-indigo-500" value={formData.discounted_price} onChange={e => setFormData({...formData, discounted_price: Number(e.target.value)})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Included Services</label>
                <div className="grid grid-cols-2 gap-2 p-2 border rounded-xl max-h-32 overflow-y-auto">
                  {services.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-xs p-1 cursor-pointer">
                      <input type="checkbox" checked={formData.service_ids.includes(s.id)} onChange={() => handleServiceToggle(s.id)} className="rounded text-indigo-600" />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 rounded-xl text-white font-bold shadow-lg transition-opacity hover:opacity-90" 
                style={{ backgroundColor: salonProfile.brand_color }}
              >
                Launch Package 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}