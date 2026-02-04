// utils/language-utils.ts
import { Language } from '@/types';

export function isValidLanguage(lang: string): lang is Language {
  const validLanguages: Language[] = ['en', 'ar', 'fr'];
  return validLanguages.includes(lang as Language);
}

export function setAppLanguage(lang: string): void {
  if (isValidLanguage(lang)) {
    // Use your store's setLanguage function
    const { setLanguage } = require('@/store/useStore').useStore.getState();
    setLanguage(lang);
  } else {
    console.warn(`Invalid language: ${lang}. Must be one of: en, ar, fr`);
  }
}