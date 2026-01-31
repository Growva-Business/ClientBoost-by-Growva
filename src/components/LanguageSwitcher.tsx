
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English', dir: 'ltr' },
    { code: 'ar', label: 'العربية', dir: 'rtl' }, //
    { code: 'fr', label: 'Français', dir: 'ltr' } //
  ];

  const changeLanguage = (lng: string, dir: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = dir; // 🌍 This flips the CRM for Arabic (RTL)
  };

  return (
    <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
      <Globe className="w-4 h-4 text-gray-400 mx-2" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code, lang.dir)}
          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
            i18n.language === lang.code 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};