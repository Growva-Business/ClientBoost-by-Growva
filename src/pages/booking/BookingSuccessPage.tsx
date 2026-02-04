import { CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';

interface BookingSuccessProps {
  booking: {
    id: string;
    service_id: string;
    booking_date: string;
    start_time: string;
  };
  onClose: () => void;
}

export default function BookingSuccessPage({ booking, onClose }: BookingSuccessProps) {
  // ✅ Removed useFetchDashboardData - this page doesn't need to fetch salon data
  const { crmEbooks, services, categories, salonProfile } = useBookingStore();

  // 1. Identify the service and category booked
  const service = services.find(s => s.id === booking.service_id);
  const category = categories.find(c => c.id === service?.category_id);
  const typeToFind = category?.type || 'hair';

  // 2. Filter professional books from your CRM database
  const filteredBooks = crmEbooks.filter(book => book.category_type === typeToFind);
  const booksPool = filteredBooks.length > 0 ? filteredBooks : crmEbooks;

  // 3. Pick a random gift
  const randomBook = booksPool[Math.floor(Math.random() * booksPool.length)];

  // 4. Generate the WhatsApp Message
  const finalMessage = encodeURIComponent(
    `Hi ${salonProfile?.name}! I just booked ${service?.name}.\n\n` +
    `I'd like to claim my free gift: "${randomBook?.title || 'Professional Guide'}"\n\n` +
    `Ref-ID: ${randomBook?.file_url}`
  );

  // 5. Connect the message to the link
  const waLink = `https://wa.me/${salonProfile?.phone}?text=${finalMessage}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 text-center border-t-8" 
           style={{ borderTopColor: salonProfile?.brand_color || '#4f46e5' }}>
        
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-5 rounded-full">
            <CheckCircle size={48} className="text-green-600" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-2">Success!</h2>
        <p className="text-gray-500 mb-8 font-medium">
          Appointment confirmed for <span className="text-gray-900 font-bold">{service?.name}</span> on {booking.booking_date}.
        </p>

        {/* 🎁 The CRM E-book Reward Section */}
        <div className="bg-indigo-50 rounded-3xl p-6 mb-8 text-left border-2 border-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              CRM Exclusive Gift
            </span>
            <h3 className="text-indigo-900 text-lg font-black mt-3">
              {randomBook?.title || 'Professional Beauty Guide'}
            </h3>
            <p className="text-indigo-700/70 text-sm font-bold mt-1 mb-5">
              Claim your professional PDF guide via WhatsApp.
            </p>
            
            <a 
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white rounded-2xl font-black shadow-lg hover:scale-[1.02] transition-all active:scale-95"
            >
              <MessageCircle size={20} /> Claim on WhatsApp
            </a>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="text-gray-400 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:text-gray-600 transition-colors"
        >
          Back to Shop <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}