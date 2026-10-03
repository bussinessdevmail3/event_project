import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { I18nManager } from 'react-native';
import i18n from 'i18next';
import { loadSavedLanguage, changeLanguage, AppLanguage } from '../i18n/config';

interface I18nContextType {
  language: AppLanguage;
  isRTL: boolean;
  changeLang: (lang: AppLanguage) => Promise<void>;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(
    (i18n.language as AppLanguage) || 'he'
  );
  const [isRTL, setIsRTL] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const lang = await loadSavedLanguage();
      const rtl = lang === 'he' || lang === 'ar';
      setLanguage(lang);
      setIsRTL(rtl);
      I18nManager.forceRTL(rtl);
      setReady(true);
    })();
  }, []);

  const changeLang = useCallback(async (lang: AppLanguage) => {
    await changeLanguage(lang);
    const rtl = lang === 'he' || lang === 'ar';
    setLanguage(lang);
    setIsRTL(rtl);
    I18nManager.forceRTL(rtl);
  }, []);

  const t = useCallback((key: string, options?: Record<string, unknown>) => {
    return i18n.t(key, options) as string;
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ language, isRTL, changeLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
