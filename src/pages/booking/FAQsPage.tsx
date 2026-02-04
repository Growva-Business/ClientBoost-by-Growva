import { useState } from 'react';
import { 
  Plus, Edit2, Trash2, HelpCircle, 
} from 'lucide-react'; 
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';

export default function FAQsPage() {
  // ✅ Master hook handles all data orchestration for the booking dashboard
  useFetchDashboardData('booking');

  const { language, currentUser } = useStore();
  const { 
    salonProfile, faqs, addFAQ, updateFAQ, deleteFAQ 
  } = useBookingStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order_index: 0,
    is_active: true
  });

  const isRTL = language === 'ar';

  // ❌ REMOVED: Redundant useEffect that manually called fetchData

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.salon_id) return;

    if (editingFAQ) {
      await updateFAQ(editingFAQ.id, formData);
    } else {
      await addFAQ({ 
        ...formData, 
        salon_id: currentUser.salon_id,
        order_index: faqs.length + 1 
      });
    }
    
    closeModal();
  };

  const openEditModal = (faq: any) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order_index: faq.order_index,
      is_active: faq.is_active
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFAQ(null);
    setFormData({ question: '', answer: '', order_index: 0, is_active: true });
  };

  if (!salonProfile) return <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest">Loading Help Center... 🛡️</div>;

  return (
    <div className="space-y-6 text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={cn(isRTL && "text-right")}>
          <h2 className="text-2xl font-black text-gray-900">FAQs</h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Frequently asked questions for your clients</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white shadow-lg transition-all active:scale-95"
          style={{ backgroundColor: salonProfile.brand_color }}
        >
          <Plus size={18} /> Add FAQ
        </button>
      </div>

      {/* FAQ List */}
      <div className="grid gap-4">
        {faqs.map((faq: any) => (
          <div key={faq.id} className={cn(
            "bg-white border border-gray-100 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md", 
            !faq.is_active && "opacity-50"
          )}>
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm" style={{ backgroundColor: salonProfile.brand_color }}>
                  {faq.order_index}
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <h3 className="font-black text-gray-900 text-lg leading-tight">{faq.question}</h3>
                  <p className="mt-2 text-sm font-medium text-gray-500">{faq.answer}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(faq)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Edit2 size={16}/></button>
                <button onClick={() => deleteFAQ(faq.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="py-24 text-center border-4 border-dashed border-gray-50 rounded-3xl bg-white/50">
            <HelpCircle size={48} className="mx-auto text-gray-100 mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No questions added yet.</p>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-6 text-gray-900">{editingFAQ ? 'Edit FAQ' : 'New FAQ'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question</label>
                <input 
                  required 
                  className={cn(
                    "w-full border-b-2 py-3 outline-none focus:border-indigo-600 transition-all font-bold text-gray-900",
                    isRTL && "text-right"
                  )} 
                  value={formData.question} 
                  onChange={e => setFormData({...formData, question: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Answer</label>
                <textarea 
                  required 
                  rows={4} 
                  className={cn(
                    "w-full border-2 border-gray-50 rounded-2xl p-4 outline-none focus:border-indigo-600 transition-all text-sm font-medium text-gray-600 bg-gray-50/50",
                    isRTL && "text-right"
                  )} 
                  value={formData.answer} 
                  onChange={e => setFormData({...formData, answer: e.target.value})} 
                />
              </div>
              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded-lg text-indigo-600"
                  checked={formData.is_active} 
                  onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                />
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Visible on booking site</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-400 font-black uppercase text-xs hover:bg-gray-100 transition-all">Cancel</button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 rounded-2xl text-white font-black uppercase text-xs shadow-lg transition-all active:scale-95" 
                  style={{ backgroundColor: salonProfile.brand_color }}
                >
                  {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}