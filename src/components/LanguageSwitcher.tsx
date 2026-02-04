import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn';
import { Globe, ChevronDown, Check } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  const currentLang = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: string) => {
    // Validate language code
    if (['en', 'ar', 'fr'].includes(langCode)) {
      setLanguage(langCode as any);
      // Store in localStorage for persistence
      localStorage.setItem('salon-crm-language', langCode);
      setIsOpen(false);
      
      // Force page reload for RTL changes
      if (langCode === 'ar' || language === 'ar') {
        setTimeout(() => window.location.reload(), 100);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <Globe size={18} className="text-gray-600" />
        <span className="font-medium">{currentLang?.flag} {currentLang?.label}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Select Language</p>
          </div>
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors",
                  language === lang.code && "bg-indigo-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                </div>
                {language === lang.code && (
                  <Check size={18} className="text-indigo-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}