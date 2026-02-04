// components/DataFetcher.tsx
import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useBookingStore } from '@/store/useBookingStore';

interface DataFetcherProps {
  children: React.ReactNode;
  dashboardType: 'booking' | 'marketing' | 'super-admin';
}

export function DataFetcher({ children, dashboardType }: DataFetcherProps) {
  const { currentUser } = useStore();
  const { fetchData, loading } = useBookingStore(); // Make sure 'loading' exists in your store
  const lastFetchedId = useRef<string | null>(null);
  const isFetching = useRef(false); // Prevent multiple simultaneous fetches

  useEffect(() => {
    // Only fetch for booking and marketing dashboards
    if (dashboardType === 'booking' || dashboardType === 'marketing') {
      const salonId = currentUser?.salon_id || '00000000-0000-0000-0000-000000000001';
      
      // ⚠️ SAFETY: Don't fetch if already fetching or same ID
      if (isFetching.current || lastFetchedId.current === salonId) {
        console.log(`✅ DataFetcher: Skipping fetch for ${salonId} - already loaded`);
        return;
      }
      
      console.log(`🎯 DataFetcher: Fetching ${dashboardType} data for salon:`, salonId);
      isFetching.current = true;
      lastFetchedId.current = salonId;
      
      fetchData(salonId).finally(() => {
        isFetching.current = false;
      });
    }
  }, [currentUser?.salon_id, dashboardType, fetchData]);

  // Show loading only for the relevant dashboard
  if ((dashboardType === 'booking' || dashboardType === 'marketing') && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-bold italic tracking-wide">
          Loading {dashboardType} data...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}