// components/LanguageInitializer.tsx
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Language } from '@/types';

export function LanguageInitializer() {
  const { language } = useStore();

  useEffect(() => {
    // Initialize language on app load
    const savedLang = (localStorage.getItem('language') as Language) || 'en';
    const savedDir = localStorage.getItem('languageDir') || 'ltr';
    
    document.documentElement.dir = savedDir;
    document.documentElement.lang = savedLang;
    document.body.dir = savedDir;
    
    console.log('🌐 Language initialized:', savedLang, savedDir);
  }, []);

  // Update document when language changes
  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.body.dir = dir;
    
    console.log('🌐 Language changed to:', language, dir);
  }, [language]);

  return null; // This component doesn't render anything
}