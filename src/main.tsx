import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {}, // We use your custom translations.ts instead
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

createRoot(document.getElementById("root")!).render(<App />);
