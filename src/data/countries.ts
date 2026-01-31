import { Country } from '@/types';

export const countries: Country[] = [
  {
    code: 'SA',
    name: 'Saudi Arabia',
    name_ar: 'المملكة العربية السعودية',
    name_fr: 'Arabie Saoudite',
    phone_prefix: '+966',
    currency: 'SAR',
    currency_symbol: 'ر.س',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    name_ar: 'الإمارات العربية المتحدة',
    name_fr: 'Émirats Arabes Unis',
    phone_prefix: '+971',
    currency: 'AED',
    currency_symbol: 'د.إ',
  },
  {
    code: 'KW',
    name: 'Kuwait',
    name_ar: 'الكويت',
    name_fr: 'Koweït',
    phone_prefix: '+965',
    currency: 'KWD',
    currency_symbol: 'د.ك',
  },
  {
    code: 'QA',
    name: 'Qatar',
    name_ar: 'قطر',
    name_fr: 'Qatar',
    phone_prefix: '+974',
    currency: 'QAR',
    currency_symbol: 'ر.ق',
  },
  {
    code: 'BH',
    name: 'Bahrain',
    name_ar: 'البحرين',
    name_fr: 'Bahreïn',
    phone_prefix: '+973',
    currency: 'BHD',
    currency_symbol: 'د.ب',
  },
  {
    code: 'OM',
    name: 'Oman',
    name_ar: 'عمان',
    name_fr: 'Oman',
    phone_prefix: '+968',
    currency: 'OMR',
    currency_symbol: 'ر.ع',
  },
  {
    code: 'EG',
    name: 'Egypt',
    name_ar: 'مصر',
    name_fr: 'Égypte',
    phone_prefix: '+20',
    currency: 'EGP',
    currency_symbol: 'ج.م',
  },
  {
    code: 'JO',
    name: 'Jordan',
    name_ar: 'الأردن',
    name_fr: 'Jordanie',
    phone_prefix: '+962',
    currency: 'JOD',
    currency_symbol: 'د.أ',
  },
  {
    code: 'LB',
    name: 'Lebanon',
    name_ar: 'لبنان',
    name_fr: 'Liban',
    phone_prefix: '+961',
    currency: 'LBP',
    currency_symbol: 'ل.ل',
  },
  {
    code: 'MA',
    name: 'Morocco',
    name_ar: 'المغرب',
    name_fr: 'Maroc',
    phone_prefix: '+212',
    currency: 'MAD',
    currency_symbol: 'د.م',
  },
  {
    code: 'TN',
    name: 'Tunisia',
    name_ar: 'تونس',
    name_fr: 'Tunisie',
    phone_prefix: '+216',
    currency: 'TND',
    currency_symbol: 'د.ت',
  },
  {
    code: 'DZ',
    name: 'Algeria',
    name_ar: 'الجزائر',
    name_fr: 'Algérie',
    phone_prefix: '+213',
    currency: 'DZD',
    currency_symbol: 'د.ج',
  },
  {
    code: 'FR',
    name: 'France',
    name_ar: 'فرنسا',
    name_fr: 'France',
    phone_prefix: '+33',
    currency: 'EUR',
    currency_symbol: '€',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    name_ar: 'المملكة المتحدة',
    name_fr: 'Royaume-Uni',
    phone_prefix: '+44',
    currency: 'GBP',
    currency_symbol: '£',
  },
  {
    code: 'US',
    name: 'United States',
    name_ar: 'الولايات المتحدة',
    name_fr: 'États-Unis',
    phone_prefix: '+1',
    currency: 'USD',
    currency_symbol: '$',
  },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find((c) => c.code === code);
};

export const getCountryName = (code: string, lang: 'en' | 'ar' | 'fr'): string => {
  const country = getCountryByCode(code);
  if (!country) return code;
  if (lang === 'ar') return country.name_ar; // Fixed property name
  if (lang === 'fr') return country.name_fr; // Fixed property name
  return country.name;
};