// components/layout/SuperAdminLayout.tsx
import { Outlet } from 'react-router-dom';

import { ReactNode, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

// 1. Define the Interface
interface SuperAdminLayoutProps {
  children: ReactNode;
}

// 2. Apply the Interface to the component
export function SuperAdminLayout() {
  const { fetchSalons, fetchInvoices, fetchAuditLogs } = useStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    // 🎯 Fetch data ONLY ONCE when layout mounts
    if (!hasFetched.current) {
      console.log("🎯 SuperAdminLayout: Fetching all admin data...");
      hasFetched.current = true;
      
      const loadData = async () => {
        try {
          if (fetchSalons) await fetchSalons();
          if (fetchInvoices) await fetchInvoices();
          if (fetchAuditLogs) await fetchAuditLogs();
        } catch (error) {
          console.error("SuperAdminLayout fetch error:", error);
        }
      };
      
      loadData();
    }
  }, [fetchSalons, fetchInvoices, fetchAuditLogs]);

  return  <Outlet />; 
}