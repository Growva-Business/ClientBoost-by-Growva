import { useState } from 'react';
import { Plus, Gift } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';

export default function GiftCardsPage() {
  // ✅ Master hook handles all data orchestration for the booking dashboard
  useFetchDashboardData('booking'); 

  const { language } = useStore();
  const { salonProfile, giftCards, addGiftCard } = useBookingStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '', 
    value: 100, 
    purchaser_name: '', 
    recipient_name: '', 
    expiry_date: '2027-01-01'
  });

  const isRTL = language === 'ar';

  // ❌ REMOVED: Redundant fetch logic or useEffects manually calling fetchData

  const generateCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, code: `GIFT-${new Date().getFullYear()}-${random}` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonProfile) return;
    
    await addGiftCard({ 
      ...formData, 
      salon_id: salonProfile.id, 
      balance: formData.value,
      is_active: true 
    });
    
    setIsModalOpen(false);
    setFormData({
      code: '', 
      value: 100, 
      purchaser_name: '', 
      recipient_name: '', 
      expiry_date: '2027-01-01'
    });
  };

  if (!salonProfile) return <div className="p-10 text-center font-black text-gray-400 uppercase tracking-widest">Loading Cards... 💳</div>;

  return (
    <div className="space-y-6 text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={cn(isRTL && "text-right")}>
          <h2 className="text-2xl font-black text-gray-900">Gift Cards</h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Issued credits and balance tracking</p>
        </div>
        <button 
          onClick={() => { 
            setIsModalOpen(true); 
            generateCode(); 
          }} 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-black uppercase text-xs shadow-lg transition-all active:scale-95" 
          style={{ backgroundColor: salonProfile.brand_color }}
        >
          <Plus size={18} /> New Gift Card
        </button>
      </div>

      {/* Gift Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {giftCards.map((card: any) => (
          <div key={card.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            <div className={cn("absolute top-0 p-4", isRTL ? "left-0" : "right-0")}>
              <span className={cn(
                "text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest", 
                card.balance > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
              )}>
                {card.balance > 0 ? 'Active' : 'Empty'}
              </span>
            </div>
            
            <div className={cn("mb-4", isRTL && "flex justify-end")}>
               <Gift size={36} style={{ color: salonProfile.brand_color }} />
            </div>

            <p className="font-black text-gray-400 uppercase text-[10px] tracking-[0.2em]">Gift Code</p>
            <h3 className="text-xl font-mono font-black text-gray-900 mt-1">{card.code}</h3>
            
            <div className="mt-8 flex justify-between items-end border-t border-gray-50 pt-4">
              <div className={cn(isRTL && "text-right")}>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Balance</p>
                <p className="text-2xl font-black text-indigo-600">{salonProfile.currency} {card.balance.toLocaleString()}</p>
              </div>
              <div className={cn("text-xs font-bold text-gray-400", isRTL ? "text-left" : "text-right")}>
                <p className="truncate max-w-[120px]">For: {card.recipient_name || 'Guest'}</p>
                <p>Exp: {new Date(card.expiry_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Gift Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-6 text-gray-900">Issue Gift Card</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Generated Code</label>
                <input 
                  readOnly 
                  className={cn(
                    "w-full border-b-2 py-3 font-mono font-black text-indigo-600 outline-none bg-gray-50/50 px-2",
                    isRTL && "text-right"
                  )} 
                  value={formData.code} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Value ({salonProfile.currency})</label>
                  <input 
                    type="number" 
                    required 
                    className={cn(
                      "w-full border-b-2 py-3 outline-none focus:border-indigo-600 font-bold transition-all",
                      isRTL && "text-right"
                    )} 
                    value={formData.value} 
                    onChange={e => setFormData({...formData, value: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient</label>
                  <input 
                    className={cn(
                      "w-full border-b-2 py-3 outline-none focus:border-indigo-600 font-bold transition-all",
                      isRTL && "text-right"
                    )} 
                    value={formData.recipient_name} 
                    onChange={e => setFormData({...formData, recipient_name: e.target.value})} 
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
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
                  Create & Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}