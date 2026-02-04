// hooks/useFetchDashboardData.ts
import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useBookingStore } from '@/store/useBookingStore';

export type DashboardType = 'booking' | 'admin' | 'marketing';

export function useFetchDashboardData(dashboardType: DashboardType) {
  const { currentUser, fetchSalons, loading: storeLoading, lastSalonsFetchTime } = useStore();
  const { fetchData, loading: bookingLoading, lastFetchedId } = useBookingStore();
  
  // Track what we've already fetched
  const hasFetched = useRef({
    salons: false,
    bookingData: false,
    currentSalonId: null as string | null
  });

  const loading = storeLoading || bookingLoading;

  useEffect(() => {
    console.log(`🎯 useFetchDashboardData: Dashboard type = ${dashboardType}`);

    switch (dashboardType) {
      case 'admin':
        // Admin needs list of ALL salons
        if (!hasFetched.current.salons && !loading) {
          console.log('📊 Fetching salons for admin dashboard');
          hasFetched.current.salons = true;
          fetchSalons();
        }
        break;

      case 'booking':
      case 'marketing':
        // Booking & Marketing need single salon data
        const salonId = currentUser?.salon_id || '00000000-0000-0000-0000-000000000001';
        
        // Only fetch if:
        // 1. We haven't fetched for this salon yet, OR
        // 2. The salon ID changed (user switched salons), AND
        // 3. We're not already loading
        const shouldFetch = 
          !loading && 
          salonId && 
          (
            hasFetched.current.currentSalonId !== salonId || 
            !hasFetched.current.bookingData
          );
        
        if (shouldFetch) {
          console.log(`📊 Fetching ${dashboardType} data for salon:`, salonId);
          hasFetched.current.bookingData = true;
          hasFetched.current.currentSalonId = salonId;
          fetchData(salonId);
        }
        break;

      default:
        console.warn('Unknown dashboard type:', dashboardType);
    }
  }, [dashboardType, currentUser, fetchSalons, fetchData, loading, lastSalonsFetchTime, lastFetchedId]);

  return { loading };
}