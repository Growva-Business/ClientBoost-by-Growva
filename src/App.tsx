import React, { useState, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { cn } from './shared/utils/cn';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';


// Stores & Context
import { useStore } from './store/useStore';
import { AuthProvider, useAuth } from './shared/lib/auth-context';
import { SalonProvider } from './Context/SalonContext';

// Components
import { AuthForm } from './components/AuthForm';
import { LoadingScreen } from './components/LoadingScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Layouts
import { SuperAdminLayout } from '@/components/SuperAdminLayout';
import { BookingLayout } from '@/components/BookingLayout';
import { MarketingLayout } from '@/components/MarketingLayout';
import { ActivityLog } from './components/ActivityLog';

// Lazy loaded pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const EbookManager = lazy(() => import('./pages/admin/EbookManager'));
const Salons = lazy(() => import('./pages/admin/Salons'));
const Invoices = lazy(() => import('./pages/admin/Invoices'));

const BookingDashboard = lazy(() => import('./pages/booking/BookingDashboard'));
const CalendarPage = lazy(() => import('./pages/booking/CalendarPage'));
const ServicesPage = lazy(() => import('./pages/booking/ServicesPage'));
const StaffPage = lazy(() => import('./pages/booking/StaffPage'));
const PackagesPage = lazy(() => import('./pages/booking/PackagesPage'));
const GiftCardsPage = lazy(() => import('./pages/booking/GiftCardsPage'));
const LoyaltyPage = lazy(() => import('./pages/booking/LoyaltyPage'));
const BookingSettingsPage = lazy(() => import('./pages/booking/BookingSettingsPage'));

const MarketingDashboard = lazy(() => import('./pages/marketing/MarketingDashboard'));
const ClientsPage = lazy(() => import('./pages/marketing/ClientsPage'));
const CampaignsPage = lazy(() => import('./pages/marketing/CampaignsPage'));
const AnalyticsPage = lazy(() => import('./pages/marketing/AnalyticsPage'));
const MarketingSettingsPage = lazy(() => import('./pages/marketing/MarketingSettingsPage'));

// Main App Layout Component
function AppLayout() {
    useMessageNotifications();
  const { language } = useStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState([]);
  const isRTL = language === 'ar';

  return (
    <div className={cn(
      "flex h-screen bg-gray-50 overflow-hidden",
      isRTL ? "flex-row-reverse" : "flex-row"
    )}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} notifications={notifications} />
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

// Protected Route Wrapper
function ProtectedRoute() {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  return <AppLayout />;
}

// Main App Router
function AppRouter() {
  const { currentUser } = useStore();
  const userRole = currentUser?.role || 'salon_owner';

  return (
    <SalonProvider>
      <Routes>
        <Route path="/auth" element={<AuthForm />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={
            userRole === 'super_admin' 
              ? <Navigate to="/admin" replace />
              : <Navigate to="/booking" replace />
          } />
          
          {/* Super Admin Routes */}
          {userRole === 'super_admin' && (
            <Route path="admin" element={<SuperAdminLayout />}>
              <Route index element={
                <Suspense fallback={<LoadingScreen />}>
                  <AdminDashboard />
                </Suspense>
              } />
              <Route path="ebooks" element={
                <Suspense fallback={<LoadingScreen />}>
                  <EbookManager />
                </Suspense>
              } />
              <Route path="salons" element={
                <Suspense fallback={<LoadingScreen />}>
                  <Salons />
                </Suspense>
              } />
              <Route path="invoices" element={
                <Suspense fallback={<LoadingScreen />}>
                  <Invoices />
                </Suspense>
              } />
              <Route path="logs" element={<ActivityLog />} />
            </Route>
          )}
          
          {/* Booking Routes */}
          <Route path="booking" element={<BookingLayout />}>
            <Route index element={
              <Suspense fallback={<LoadingScreen />}>
                <BookingDashboard />
              </Suspense>
            } />
            <Route path="calendar" element={
              <Suspense fallback={<LoadingScreen />}>
                <CalendarPage />
              </Suspense>
            } />
            <Route path="services" element={
              <Suspense fallback={<LoadingScreen />}>
                <ServicesPage />
              </Suspense>
            } />
            <Route path="staff" element={
              <Suspense fallback={<LoadingScreen />}>
                <StaffPage />
              </Suspense>
            } />
            <Route path="packages" element={
              <Suspense fallback={<LoadingScreen />}>
                <PackagesPage />
              </Suspense>
            } />
            <Route path="gift-cards" element={
              <Suspense fallback={<LoadingScreen />}>
                <GiftCardsPage />
              </Suspense>
            } />
            <Route path="loyalty" element={
              <Suspense fallback={<LoadingScreen />}>
                <LoyaltyPage />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<LoadingScreen />}>
                <BookingSettingsPage />
              </Suspense>
            } />
          </Route>
          
          {/* Marketing Routes */}
          <Route path="marketing" element={<MarketingLayout />}>
            <Route index element={
              <Suspense fallback={<LoadingScreen />}>
                <MarketingDashboard />
              </Suspense>
            } />
            <Route path="clients" element={
              <Suspense fallback={<LoadingScreen />}>
                <ClientsPage />
              </Suspense>
            } />
            <Route path="campaigns" element={
              <Suspense fallback={<LoadingScreen />}>
                <CampaignsPage />
              </Suspense>
            } />
            <Route path="analytics" element={
              <Suspense fallback={<LoadingScreen />}>
                <AnalyticsPage />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<LoadingScreen />}>
                <MarketingSettingsPage />
              </Suspense>
            } />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SalonProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          className: '!bg-white !text-gray-900 !border !border-gray-200 !shadow-lg',
          duration: 4000,
        }} />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}