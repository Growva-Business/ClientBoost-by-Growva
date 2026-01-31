import { getCountryByCode } from '@/data/countries';

/**
 * Combines country prefix with local number for WhatsApp formatting.
 * Handles potential undefined countries to prevent crashes.
 */
export const handlePhoneSetup = (countryCode: string, localNumber: string): string => {
  const country = getCountryByCode(countryCode);
  
  // 🧸 Error 18048 Fixed: Safety check if country is not found
  if (!country || !country.phone_prefix) {
    return localNumber;
  }
  
  // 🧸 Error 2592 & 1160 Fixed: Using standard string concatenation 
  // instead of backticks to avoid "Unterminated template literal" errors.
  return country.phone_prefix + localNumber;
};