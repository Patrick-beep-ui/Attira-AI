import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

export const DEFAULT_LANGUAGE = "es";

type Language = "en" | "es";

const translations: Record<Language, typeof en> = { en, es };

type ValueType = "occasions" | "formality" | "categories" | "weather_conditions" | "body_types" | "body_type_names" | "fits" | "style_preferences";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tValue: (type: ValueType, value: string) => string;
  tValueReverse: (type: ValueType, value: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("app-language");
    return (stored as Language) || DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    localStorage.setItem("app-language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: unknown = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    
    let result = typeof value === "string" ? value : key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(`{${k}}`, String(v));
      }
    }
    return result;
  };

  const tValue = (type: ValueType, value: string): string => {
    const values = translations[language].values?.[type] as Record<string, string> | undefined;
    const key = value.replace(/ /g, "_").toLowerCase();
    if (values && key in values) {
      return values[key];
    }
    return value;
  };

  const tValueReverse = (type: ValueType, value: string): string => {
    const currentValues = translations[language].values?.[type] as Record<string, string> | undefined;
    const englishValues = translations.en.values?.[type] as Record<string, string> | undefined;
    
    if (currentValues) {
      for (const [eng, translated] of Object.entries(currentValues)) {
        if (translated === value) {
          return eng;
        }
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tValue, tValueReverse }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}