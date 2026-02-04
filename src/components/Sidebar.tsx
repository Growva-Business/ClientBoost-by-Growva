import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn';
import { 
  LayoutDashboard, Calendar, Scissors, Users, 
  Package, CreditCard, Target, Settings,
  BarChart3, MessageSquare, Users as ClientsIcon,
  ChevronLeft, ChevronRight, LogOut, HelpCircle
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = {
  booking: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/booking' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/booking/calendar' },
    { id: 'services', label: 'Services', icon: Scissors, path: '/booking/services' },
    { id: 'staff', label: 'Staff', icon: Users, path: '/booking/staff' },
    { id: 'packages', label: 'Packages', icon: Package, path: '/booking/packages' },
    { id: 'gift-cards', label: 'Gift Cards', icon: CreditCard, path: '/booking/gift-cards' },
    { id: 'loyalty', label: 'Loyalty', icon: Target, path: '/booking/loyalty' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/booking/settings' },
  ],
  marketing: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/marketing' },
    { id: 'clients', label: 'Clients', icon: ClientsIcon, path: '/marketing/clients' },
    { id: 'campaigns', label: 'Campaigns', icon: MessageSquare, path: '/marketing/campaigns' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/marketing/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/marketing/settings' },
  ],
  admin: [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { id: 'salons', label: 'Salons', icon: Users, path: '/admin/salons' },
    { id: 'ebooks', label: 'Ebooks', icon: Package, path: '/admin/ebooks' },
    { id: 'invoices', label: 'Invoices', icon: CreditCard, path: '/admin/invoices' },
    { id: 'logs', label: 'Activity Logs', icon: BarChart3, path: '/admin/logs' },
  ]
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, currentUser } = useStore();
  const isRTL = language === 'ar';
  
  const userRole = currentUser?.role || 'salon_owner';
  const currentNavItems = navItems[userRole === 'super_admin' ? 'admin' : 'booking'];
  
  // Determine if we're in marketing section
  const isMarketing = location.pathname.startsWith('/marketing');
  const activeNavItems = isMarketing ? navItems.marketing : currentNavItems;

  return (
    <aside className={cn(
      "flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out z-50 relative",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">SalonCRM</h1>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">S</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-4">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">
              {isMarketing ? 'Marketing' : userRole === 'super_admin' ? 'Admin' : 'Booking'}
            </p>
          )}
        </div>
        
        {activeNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group",
                isActive 
                  ? "bg-gradient-to-r from-indigo-600/20 to-indigo-600/10 text-white border-l-4 border-indigo-500" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
                collapsed && "justify-center"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-indigo-500 text-white" 
                  : "bg-gray-800 text-gray-400 group-hover:bg-indigo-500 group-hover:text-white"
              )}>
                <item.icon size={18} />
              </div>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        {!collapsed && (
          <div className="px-4 py-3 bg-gray-800/50 rounded-xl">
            <p className="text-sm font-medium">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-gray-400 mt-1">{currentUser?.role?.replace('_', ' ') || 'Salon Owner'}</p>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <button className={cn(
            "p-3 rounded-xl hover:bg-gray-800 transition-colors flex-1",
            collapsed && "justify-center"
          )}>
            <div className="flex items-center gap-3">
              <Settings size={18} className="text-gray-400" />
              {!collapsed && <span className="text-sm text-gray-300">Settings</span>}
            </div>
          </button>
          
          <button className={cn(
            "p-3 rounded-xl hover:bg-gray-800 transition-colors flex-1",
            collapsed && "justify-center"
          )}>
            <div className="flex items-center gap-3">
              <HelpCircle size={18} className="text-gray-400" />
              {!collapsed && <span className="text-sm text-gray-300">Help</span>}
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}