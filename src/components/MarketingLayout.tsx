import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users,
  Megaphone,
  BarChart3,
  DollarSign,
  Settings, 
  LogOut,
  Menu,
  X,
  Globe,
  ChevronDown,
  Calendar,
  Filter
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useBookingStore } from '@/store/useBookingStore';
import { getTranslation } from '@/localization/translations';
import { cn } from '@/shared/utils/cn';
import { Language } from '@/types';

interface MarketingLayoutProps {
  children: ReactNode;
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/marketing' },
  { key: 'clients', label: 'Clients', icon: Users, path: '/marketing/clients' },
  { key: 'campaigns', label: 'Campaigns', icon: Megaphone, path: '/marketing/campaigns' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, path: '/marketing/analytics' },
  { key: 'staffReports', label: 'Staff Reports', icon: DollarSign, path: '/marketing/staff-reports' },
  { key: 'filters', label: 'Saved Filters', icon: Filter, path: '/marketing/filters' },
  { key: 'settings', label: 'Settings', icon: Settings, path: '/marketing/settings' },
];

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export function MarketingLayout({ children }: MarketingLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, sidebarOpen, setSidebarOpen } = useStore();
  const { salonProfile } = useBookingStore();
  const t = (key: string) => getTranslation(language, key);
  const isRTL = language === 'ar';

  const pageTitle = navItems.find(item => 
    location.pathname === item.path || 
    (item.path !== '/marketing' && location.pathname.startsWith(item.path))
  )?.label || 'Marketing Dashboard';

  return (
    <div className={cn("min-h-screen bg-gray-50", isRTL && "rtl")} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 z-40 h-screen bg-gradient-to-b from-rose-600 to-rose-700 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          isRTL ? "right-0" : "left-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Marketing</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/marketing' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.key}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                  !sidebarOpen && "justify-center"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
          {sidebarOpen ? (
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/booking')}
                className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                <Calendar className="h-4 w-4" />
                Go to Booking
              </button>
              <button 
                onClick={() => navigate('/')}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/booking')}
                className="flex w-full items-center justify-center rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <Calendar className="h-5 w-5" />
              </button>
              <button 
                onClick={() => navigate('/')}
                className="flex w-full items-center justify-center rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("transition-all duration-300", sidebarOpen ? (isRTL ? "mr-64" : "ml-64") : (isRTL ? "mr-20" : "ml-20"))}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
          
          <div className="flex items-center gap-4">
            {/* Language selector */}
            <div className="relative group">
              <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
                <Globe className="h-4 w-4 text-gray-500" />
                <span>{languages.find(l => l.code === language)?.flag}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              <div className="absolute right-0 top-full mt-1 hidden w-40 rounded-lg border bg-white py-1 shadow-lg group-hover:block">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50",
                      language === lang.code && "bg-rose-50 text-rose-600"
                    )}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Salon info */}
            <div className="flex items-center gap-2">
              <div 
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: salonProfile.brandColor }}
              />
              <span className="text-sm font-medium text-gray-700">{salonProfile.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
