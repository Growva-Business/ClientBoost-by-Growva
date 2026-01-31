import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { useBookingStore } from './store/useBookingStore';
import { getTranslation } from './localization/translations';
import { cn } from './shared/utils/cn';
import { supabase } from '@/shared/lib/supabase';
// --- 🛠️ CORRECTED PATHS BASED ON YOUR STRUCTURE ---
// Super Admin (from the admin folder)
import { Dashboard } from './pages/admin/Dashboard'; 
import { EbookManager } from './pages/admin/EbookManager';
import { ActivityLog } from './components/ActivityLog';
import { Salons } from './pages/admin/Salons';       // Salons Management
import {Invoices} from './pages/admin/Invoices'; 

// Booking Dashboard (from the booking folder)
import { BookingDashboard } from './pages/booking/BookingDashboard';
import { CalendarPage } from './pages/booking/CalendarPage';
// Ensure this matches the export name in your file
import { ServicesPage } from './pages/booking/ServicesPage';
import { StaffPage } from './pages/booking/StaffPage';     // Fixed "declared but never read" by using it in switch
import { PackagesPage } from './pages/booking/PackagesPage';
import { GiftCardsPage } from './pages/booking/GiftCardsPage';
import { LoyaltyPage } from './pages/booking/LoyaltyPage';

// Marketing Dashboard
import { MarketingDashboard } from './pages/marketing/MarketingDashboard';
import { ClientsPage } from './pages/marketing/ClientsPage';
import { CampaignsPage } from './pages/marketing/CampaignsPage';
import { AnalyticsPage } from './pages/marketing/AnalyticsPage';
import { MarketingSettingsPage } from './pages/marketing/MarketingSettingsPage';

import { LanguageSwitcher } from './components/LanguageSwitcher';

// Icons
import { 
  LayoutDashboard, Store, CreditCard, Activity, 
  Settings, Calendar, Scissors, Users, 
  UserCircle, Target, BarChart3, TrendingUp, 
  ChevronLeft, ChevronRight, Search, Package as PackageIcon
} from 'lucide-react';

type DashboardType = 'super-admin' | 'booking' | 'marketing';
// Update the interface in useBookingStore.ts
interface BookingStoreState {
  // ... other properties
  
  fetchData: (salonId?: string) => Promise<void>; // ✅ Make parameter optional
  createDemoSalon: (salonId: string) => Promise<any>; // ✅ Add this to interface
  
  // ... other methods
}
export function App() {
  const { language } = useStore();
  const t = (key: string) => getTranslation(language, key);

  const [currentDashboard, setCurrentDashboard] = useState<DashboardType>('booking');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { fetchData, loading, salonProfile } = useBookingStore();
  


 // Replace the hardcoded fetchData in App.tsx with:
useEffect(() => {
  const checkDatabase = async () => {
    console.log("=== CHECKING DATABASE ===");
    
    // List ALL salons
    const { data: allSalons, error } = await supabase
      .from('salons')
      .select('id, name, email, created_at')
      .order('created_at');
    
    if (error) {
      console.error("Error fetching salons:", error);
    } else {
      console.log("All salons in database:", allSalons);
      console.log("Total salons:", allSalons?.length || 0);
    }
    
    // Now fetch data
    fetchData();
  };
  
  checkDatabase();
}, []);



 const getNavItems = () => {
    // 1. Super Admin Section
    if (currentDashboard === 'super-admin') return [
      { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
      { id: 'api-usage', label: t('ebookLibrary'), icon: Activity },
      { id: 'salons', label: t('salons'), icon: Store },
      { id: 'billing', label: t('billing'), icon: CreditCard },
      { id: 'logs', label: t('auditLogs'), icon: Activity },
      { id: 'settings', label: t('settings'), icon: Settings },
    ];

    // 2. Marketing Section (Focus on Growth)
    if (currentDashboard === 'marketing') return [
      { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
      { id: 'clients', label: t('clients'), icon: UserCircle },
      { id: 'campaigns', label: t('campaigns'), icon: Target },
      { id: 'analytics', label: t('analytics'), icon: BarChart3 },
      { id: 'settings', label: t('settings'), icon: Settings },
    ];

    // 3. Booking Dashboard (Operational - Staff use this most)
    // This is the default return for 'booking'
    return [
      { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
      { id: 'calendar', label: t('calendar'), icon: Calendar },
      { id: 'services', label: t('services'), icon: Scissors },
      { id: 'packages', label: t('packages'), icon: PackageIcon },
      { id: 'staff', label: t('staff'), icon: Users },
      { id: 'gift-cards', label: t('giftCards'), icon: CreditCard }, // Correctly placed for booking
      { id: 'loyalty', label: t('loyalty'), icon: Target },           // Correctly placed for booking
      { id: 'settings', label: t('settings'), icon: Settings },
    ];
  };
  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold">{t('loading')}</p>
      </div>
    );

   if (currentDashboard === 'super-admin') {
  switch (activeTab) {
    case 'dashboard': return <Dashboard />;
    case 'salons': return <Salons />; // Ensure you import your Salons page
    case 'billing': return <Invoices/>; // Invoices.tsx handles your billing
    case 'api-usage': return <EbookManager />;
     case 'logs': return <ActivityLog />;
    
    default: return <Dashboard />;
  }
}
    if (currentDashboard === 'marketing') {
      switch (activeTab) {
        case 'dashboard': return <MarketingDashboard />;
        case 'clients': return <ClientsPage />;
        case 'campaigns': return <CampaignsPage />;
        case 'analytics': return <AnalyticsPage />;
        case 'settings': return <MarketingSettingsPage />;
        default: return <MarketingDashboard />;
      }
    }

    // 🛠️ FIX: Using the declared components to fix "declared but never read"
   // Inside renderContent() -> Booking Dashboard section
switch (activeTab) {
  case 'dashboard': return <BookingDashboard />;
  case 'calendar': return <CalendarPage />;
  // CHANGE THIS from ServicePage to ServicesPage
  case 'services': return <ServicesPage />; 
  case 'packages': return <PackagesPage />;
  case 'staff': return <StaffPage />;
  case 'gift-cards': return <GiftCardsPage />; 
  case 'loyalty': return <LoyaltyPage />;
  default: return <BookingDashboard />;
}
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <aside className={cn("bg-white border-r-2 border-gray-100 transition-all duration-300 flex flex-col", sidebarOpen ? "w-72" : "w-24")}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-2xl font-black tracking-tighter text-indigo-600 italic">SALON CRM</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-50 rounded-xl">
            {sidebarOpen ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <div className="mb-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
            {currentDashboard.replace('-', ' ')}
          </div>
          
          {getNavItems().map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black transition-all",
                activeTab === item.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon size={22} />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={() => {
              const sequence: DashboardType[] = ['booking', 'marketing', 'super-admin'];
              const next = sequence[(sequence.indexOf(currentDashboard) + 1) % sequence.length];
              setCurrentDashboard(next);
              setActiveTab('dashboard');
            }}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all"
          >
            <TrendingUp size={22} />
            {sidebarOpen && <span className="text-sm">{t('nav.nextDashboard')}</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input placeholder={t('common.searchPlaceholder')} className="bg-gray-50 border-none rounded-xl pl-12 pr-6 py-2.5 text-sm w-80 outline-none" />
          </div>
          
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-black text-gray-900">{salonProfile?.name || t('common.superAdmin')}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentDashboard}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">SA</div>
            </div>
          </div>
        </header>
        <div className="p-10">{renderContent()}</div>
      </main>
    </div>
  );
}
export default App;