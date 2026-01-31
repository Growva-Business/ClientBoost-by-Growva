import { useState, useEffect } from 'react';

import { 
  Plus, Gift 
} from 'lucide-react'; // 🧸 Cleaned: Removed unused icons to clear warnings
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn';

export function GiftCardsPage() {
  const { currentUser } = useStore();
  const { salonProfile, giftCards, fetchData, addGiftCard } = useBookingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '', value: 100, purchaser_name: '', recipient_name: '', expiry_date: '2027-01-01'
  });

  useEffect(() => {
    if (currentUser?.salon_id) fetchData(currentUser.salon_id);
  }, [currentUser, fetchData]);

  const generateCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, code: `GIFT-${new Date().getFullYear()}-${random}` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.salon_id) {
      await addGiftCard({ 
        ...formData, 
        salon_id: currentUser.salon_id, 
        balance: formData.value,
        is_active: true 
      });
      setIsModalOpen(false);
    }
  };

  if (!salonProfile) return <div className="p-10 text-center">Loading Cards... 💳</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gift Cards</h2>
          <p className="text-gray-500">Issued credits and balance tracking</p>
        </div>
        <button onClick={() => { setIsModalOpen(true); generateCode(); }} className="px-4 py-2.5 rounded-lg text-white font-bold shadow-lg" style={{ backgroundColor: salonProfile.brand_color }}>
          <Plus size={18} className="inline mr-2"/> New Gift Card
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {giftCards.map((card: any) => (
          <div key={card.id} className="bg-white border rounded-2xl p-6 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase", card.balance > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400")}>
                  {card.balance > 0 ? 'Active' : 'Empty'}
                </span>
             </div>
             <Gift size={32} style={{ color: salonProfile.brand_color }} />
             <p className="mt-4 font-black text-gray-400 uppercase text-xs tracking-widest">Gift Code</p>
             <h3 className="text-xl font-mono font-bold text-gray-900">{card.code}</h3>
             
             <div className="mt-6 flex justify-between items-end border-t pt-4">
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Balance</p>
                   <p className="text-2xl font-black text-indigo-600">{salonProfile.currency} {card.balance}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                   <p>For: {card.recipient_name || 'Valued Guest'}</p>
                   <p>Exp: {new Date(card.expiry_date).toLocaleDateString()}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* --- CREATE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Issue Gift Card</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Generated Code</label>
                <input readOnly className="w-full border-b py-2 font-mono font-bold text-indigo-600 outline-none" value={formData.code} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Value ({salonProfile.currency})</label>
                  <input type="number" required className="w-full border-b py-2 outline-none" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Recipient</label>
                  <input className="w-full border-b py-2 outline-none" value={formData.recipient_name} onChange={e => setFormData({...formData, recipient_name: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-4 rounded-xl text-white font-bold shadow-lg mt-4" style={{ backgroundColor: salonProfile.brand_color }}>Create & Issue</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}