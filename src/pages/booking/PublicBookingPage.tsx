import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useBookingStore } from '@/store/useBookingStore';
import { PremiumSmartWidget } from '@/pages/widget/BookingWidget';

export function PublicBookingPage() {
  const { salonId } = useParams();
  const { fetchData, salonProfile, loading } = useBookingStore();

  useEffect(() => {
    if (salonId) fetchData(salonId); // Load the specific salon's branding
  }, [salonId, fetchData]);

  if (loading || !salonProfile) return <div className="loading-screen">✨ Sarah is getting ready...</div>;

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center p-4">
      {/* Passing standalone=true makes Sarah open by default and full-screen */}
      <PremiumSmartWidget standalone={true} forceOpen={true} />
    </div>
  );
}