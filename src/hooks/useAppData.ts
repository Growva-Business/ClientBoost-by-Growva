// hooks/useAppData.ts (or wherever your useAppData hook is)
import { useStore } from '@/store/useStore';
import { useBookingStore } from '@/store/useBookingStore';

export function useAppData() {
  const { 
    language,
    setLanguage,
    userRole, // ✅ Now available
    sidebarOpen,
    setSidebarOpen,
    currentUser,
    loading
  } = useStore();
  
  const { 
    salonProfile,
    // ... other booking store properties
  } = useBookingStore();
  
  return {
    language,
    setLanguage,
    userRole,
    sidebarOpen,
    setSidebarOpen,
    currentUser,
    loading,
    salonProfile,
    // ... other properties
  };
}



// // hooks/useAppData.ts (or wherever your useAppData hook is)
// import { useStore } from '@/store/useStore';
// import { useBookingStore } from '@/store/useBookingStore';

// export function useAppData() {
//   const { 
//     language,
//     setLanguage,
//     userRole, // ✅ Now available
//     sidebarOpen,
//     setSidebarOpen,
//     currentUser,
//     loading
//   } = useStore();
  
//   const { 
//     salonProfile,
//     // ... other booking store properties
//   } = useBookingStore();
  
//   return {
//     language,
//     setLanguage,
//     userRole,
//     sidebarOpen,
//     setSidebarOpen,
//     currentUser,
//     loading,
//     salonProfile,
//     // ... other properties
//   };
// }