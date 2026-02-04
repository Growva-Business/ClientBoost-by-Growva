import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';
import { 
  Search, Bell, ChevronDown, HelpCircle, 
  User, Settings, LogOut, Moon, Sun
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  notifications: any[];
}

export function Header({ searchQuery, onSearchChange, notifications }: HeaderProps) {
  const { language } = useStore();
  const { salonProfile } = useBookingStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const isRTL = language === 'ar';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section - Breadcrumb */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">SalonCRM</span>
            <ChevronDown size={12} className="rotate-270" />
            <span className="text-gray-700 font-semibold">
              {salonProfile?.name || 'Dashboard'}
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 text-gray-400",
              isRTL ? "right-4" : "left-4"
            )} size={18} />
            <input
              type="text"
              placeholder="Search clients, appointments, services..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                "w-full bg-gray-50 border-none rounded-xl py-3 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                isRTL ? "pr-12 pl-6" : "pl-12 pr-6"
              )}
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={20} className="text-gray-600" /> : <Moon size={20} className="text-gray-600" />}
          </button>

          {/* Help */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <HelpCircle size={20} className="text-gray-600" />
          </button>

          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
              <div className={cn("text-left", isRTL && "text-right")}>
                <p className="text-sm font-semibold text-gray-900">User Name</p>
                <p className="text-xs text-gray-500">Salon Owner</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className={cn(
                "absolute top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50",
                isRTL ? "left-0" : "right-0"
              )}>
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">User Name</p>
                  <p className="text-sm text-gray-500">user@salon.com</p>
                </div>
                <div className="py-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                    <User size={18} className="text-gray-400" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                    <Settings size={18} className="text-gray-400" />
                    <span>Account Settings</span>
                  </button>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-red-600 text-left">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}