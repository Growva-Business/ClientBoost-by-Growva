import React from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App';
import { SalonProvider } from './context/SalonContext';

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {}, // We use your custom translations.ts instead
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { 
      escapeValue: false 
    }
  });

// Get the root element
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

// Render the app
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <SalonProvider>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </SalonProvider>
    </I18nextProvider>
  </React.StrictMode>
);