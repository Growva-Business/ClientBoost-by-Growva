// import { Building, Zap, X } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';

interface UpgradePopupProps {
  onClose: () => void;
  reason: 'STAFF_LIMIT' | 'AUTOMATION_LIMIT';
}

export function UpgradePopup({ onClose, reason }: UpgradePopupProps) {
  const { salonProfile } = useBookingStore();

  const content = {
    STAFF_LIMIT: {
      title: "Expand Your Team",
      desc: `You've reached the ${salonProfile?.max_staff_limit} artist limit on your current plan.`
    },
    AUTOMATION_LIMIT: {
      title: "Unlock Automation",
      desc: "E-book gifts and Auto-confirmations are Pro features. Upgrade to save 5+ hours a week."
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl border-t-8" 
           style={{ borderTopColor: salonProfile?.brand_color }}>
        <h3 className="text-2xl font-black text-gray-900 mb-2">{content[reason].title}</h3>
        <p className="text-gray-500 mb-8">{content[reason].desc}</p>
        
        <button className="w-full py-4 rounded-2xl text-white font-bold shadow-lg"
                style={{ backgroundColor: salonProfile?.brand_color }}>
          View Pricing Plans
        </button>
        
        <button onClick={onClose} className="mt-4 text-sm font-bold text-gray-400 hover:text-gray-600">
          Maybe Later
        </button>
      </div>
    </div>
  );
}