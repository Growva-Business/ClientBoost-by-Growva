import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, HelpCircle, 
} from 'lucide-react'; // 🧸 Cleaned: Removed unused icons to clear warnings
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn';

export function FAQsPage() {
  const { currentUser } = useStore();
  const { 
    salonProfile, faqs, fetchData, addFAQ, updateFAQ, deleteFAQ 
  } = useBookingStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order_index: 0,
    is_active: true
  });

  useEffect(() => {
    if (currentUser?.salon_id) fetchData(currentUser.salon_id);
  }, [currentUser, fetchData]);

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

  if (!salonProfile) return <div className="p-10 text-center text-gray-400">Loading Help Center... 🛡️</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">FAQs</h2>
          <p className="text-gray-500">Frequently asked questions for your clients</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg"
          style={{ backgroundColor: salonProfile.brand_color }}
        >
          <Plus size={18} /> Add FAQ
        </button>
      </div>

      {/* FAQ List */}
      <div className="grid gap-4">
        {faqs.map((faq: any) => (
          <div key={faq.id} className={cn("bg-white border rounded-2xl p-6 shadow-sm", !faq.is_active && "opacity-50")}>
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: salonProfile.brand_color }}>
                  {faq.order_index}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{faq.question}</h3>
                  <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(faq)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                <button onClick={() => deleteFAQ(faq.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed rounded-2xl">
            <HelpCircle size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">No questions added yet.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
            <h3 className="text-xl font-bold mb-6">{editingFAQ ? 'Edit FAQ' : 'New FAQ'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Question</label>
                <input required className="w-full border-b py-2 outline-none focus:border-indigo-500" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Answer</label>
                <textarea required rows={3} className="w-full border rounded-lg p-2 mt-2 outline-none focus:border-indigo-500 text-sm" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                <label className="text-sm text-gray-600">Visible on booking site</label>
              </div>
              <button type="submit" className="w-full py-4 rounded-xl text-white font-bold shadow-lg mt-4" style={{ backgroundColor: salonProfile.brand_color }}>
                {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}