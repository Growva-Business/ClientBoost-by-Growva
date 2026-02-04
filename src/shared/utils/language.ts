// utils/language.ts
import { Language } from '@/types';

export function safeSetLanguage(
  setter: (lang: Language) => void,
  lang: string
): void {
  if (lang === 'en' || lang === 'ar' || lang === 'fr') {
    setter(lang as Language);
  } else {
    console.warn(`Invalid language: ${lang}. Using 'en' instead.`);
    setter('en');
  }
}