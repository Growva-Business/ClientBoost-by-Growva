import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Scissors, Clock, DollarSign, X, Settings2 
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn';
import { CategoryManager } from '@/components/CategoryManager';

export function ServicesPage() {
  const { language, currentUser } = useStore();
  const { 
    salonProfile, services, categories, fetchData, addService, updateService, deleteService 
  } = useBookingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // 🧸 Now used to show/hide the modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    name_fr: '',
    category_id: '',
    duration_minutes: 30,
    price: 0,
    is_active: true
  });

  useEffect(() => {
    if (currentUser?.salon_id) fetchData(currentUser.salon_id);
  }, [currentUser, fetchData]);

  // 🧸 handleSubmit is now used by the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.salon_id) return;

    if (editingService) {
      await updateService(editingService.id, formData);
    } else {
      await addService({ ...formData, salon_id: currentUser.salon_id });
    }
    closeModal();
  };

  const openEditModal = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      name_ar: service.name_ar || '',
      name_fr: service.name_fr || '',
      category_id: service.category_id || '',
      duration_minutes: service.duration_minutes,
      price: service.price,
      is_active: service.is_active
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ name: '', name_ar: '', name_fr: '', category_id: '', duration_minutes: 30, price: 0, is_active: true });
  };

  const getServiceName = (service: any) => {
    if (language === 'ar') return service.name_ar || service.name;
    if (language === 'fr') return service.name_fr || service.name;
    return service.name;
  };

  const filteredServices = services.filter((s: any) => 
    getServiceName(s).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!salonProfile) return <div className="p-10 text-center text-gray-400">Loading Menu... <Scissors className="inline animate-bounce"/></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          <p className="text-gray-500">Manage pricing and multi-language names</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2.5 rounded-lg border bg-white text-gray-600 font-bold hover:bg-gray-50">
            <Settings2 size={18} className="inline mr-2" /> Categories
          </button>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 rounded-lg text-white font-bold shadow-lg" style={{ backgroundColor: salonProfile.brand_color }}>
            <Plus size={18} className="inline mr-2" /> Add Service
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
         id="salonName" 
         name="name"
          type="text"
          placeholder="Search services..."
          className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Services Grid */}
      <div className="space-y-8">
        {categories.map((cat: any) => {
          const catServices = filteredServices.filter((s: any) => s.category_id === cat.id);
          if (catServices.length === 0) return null;

          return (
            <div key={cat.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">{cat.name}</h3>
              </div>
              <table className="w-full text-left">
                <tbody className="divide-y">
                  {catServices.map((service: any) => (
                    <tr key={service.id} className={cn("hover:bg-gray-50", !service.is_active && "opacity-50")}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Scissors size={16} className="text-gray-300" /> {/* 🧸 Scissors used here */}
                          <div>
                            <p className="font-bold text-gray-900">{getServiceName(service)}</p>
                            <p className="text-xs text-gray-400"><Clock size={12} className="inline"/> {service.duration_minutes} min</p> {/* 🧸 Clock used here */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600">
                        <DollarSign size={14} className="inline"/> {service.price} {/* 🧸 DollarSign used here */}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => openEditModal(service)} className="text-gray-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                        <button onClick={() => deleteService(service.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {isCategoryModalOpen && <CategoryManager onClose={() => setIsCategoryModalOpen(false)} />}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingService ? 'Edit Service' : 'New Service'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20}/></button> {/* 🧸 X used here */}
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Form Content */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                <select required className="w-full border-b py-2 bg-transparent" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              {/* ... Rest of form ... */}
              <button type="submit" className="w-full py-4 rounded-xl text-white font-bold" style={{ backgroundColor: salonProfile.brand_color }}>
                {editingService ? 'Save Changes' : 'Create Service'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}