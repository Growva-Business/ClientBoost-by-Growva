import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar,
  Scissors,
  Package,
  Users,
  HelpCircle,
  Gift,
  Star,
  Settings, 
  LogOut,
  Menu,
  X,
  Globe,
  ChevronDown,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useBookingStore } from '@/store/useBookingStore';
import { getTranslation } from '@/localization/translations';
import { cn } from '@/shared/utils/cn';
import { Language } from '@/types';

interface BookingLayoutProps {
  children: ReactNode;
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/booking' },
  { key: 'calendar', label: 'Calendar', icon: Calendar, path: '/booking/calendar' },
  { key: 'services', label: 'Services', icon: Scissors, path: '/booking/services' },
  { key: 'packages', label: 'Packages', icon: Package, path: '/booking/packages' },
  { key: 'staff', label: 'Staff', icon: Users, path: '/booking/staff' },
  { key: 'loyalty', label: 'Loyalty', icon: Star, path: '/booking/loyalty' },
  { key: 'giftCards', label: 'Gift Cards', icon: Gift, path: '/booking/gift-cards' },
  { key: 'faqs', label: 'FAQs', icon: HelpCircle, path: '/booking/faqs' },
  { key: 'messages', label: 'Messages', icon: MessageSquare, path: '/booking/messages' },
  { key: 'profileSettings', label: 'Settings', icon: Settings, path: '/booking/settings' },
];

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export function BookingLayout({ children }: BookingLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, sidebarOpen, setSidebarOpen } = useStore();
  const { salonProfile, dailyLimits } = useBookingStore();
  const t = (key: string) => getTranslation(language, key);
  const isRTL = language === 'ar';

  const pageTitle = navItems.find(item => 
    location.pathname === item.path || 
    (item.path !== '/booking' && location.pathname.startsWith(item.path))
  )?.label || 'Dashboard';

  return (
    <div className={cn("min-h-screen bg-gray-50", isRTL && "rtl")} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 z-40 h-screen transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          isRTL ? "right-0" : "left-0"
        )}
        style={{ background: `linear-gradient(to bottom, ${salonProfile.brandColor}, ${salonProfile.brandColor}dd)` }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              {salonProfile.logo ? (
                <img src={salonProfile.logo} alt={salonProfile.name} className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <Scissors className="h-6 w-6 text-white" />
                </div>
              )}
              <span className="text-lg font-bold text-white truncate max-w-[140px]">{salonProfile.name}</span>
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
              (item.path !== '/booking' && location.pathname.startsWith(item.path));
            
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

        {/* Message Stats */}
        {sidebarOpen && (
          <div className="absolute bottom-24 left-3 right-3">
            <div className="rounded-lg bg-white/10 p-3">
              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Daily Messages</span>
                <span>{dailyLimits.usedTotal}/{dailyLimits.total}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(dailyLimits.usedTotal / dailyLimits.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
          {sidebarOpen ? (
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/marketing')}
                className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                <TrendingUp className="h-4 w-4" />
                Go to Marketing
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
                onClick={() => navigate('/marketing')}
                className="flex w-full items-center justify-center rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <TrendingUp className="h-5 w-5" />
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
                      language === lang.code && "bg-indigo-50 text-indigo-600"
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
