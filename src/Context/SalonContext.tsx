import React, { createContext, useContext, useEffect, useState } from 'react';
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

const SalonContext = createContext<any>(null);

export const SalonProvider = ({ children }: { children: React.ReactNode }) => {
  const { fetchData, loading, salonProfile } = useBookingStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      // If we haven't initialized, try to fetch data
      if (!isInitialized && !loading) {
        try {
          // IMPORTANT: Ensure this UUID actually exists in your 'salons' table!
          await fetchData('00000000-0000-0000-0000-000000000001');
          setIsInitialized(true);
        } catch (err) {
          console.error("Initialization failed", err);
          setIsInitialized(true); // Set to true anyway to break the loading loop
        }
      }
    };
    init();
  }, [fetchData, isInitialized, loading]);

  // Only show loading if we are actually fetching AND haven't initialized yet
  const contextValue = { 
    salonProfile, 
    loading: loading && !isInitialized, 
    language: 'en' 
  };

  return (
    <SalonContext.Provider value={contextValue}>
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => useContext(SalonContext);