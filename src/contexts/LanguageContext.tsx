"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Lang } from "@/lib/i18n";

interface LangCtx {
  lang: Lang;
  toggle: () => void;
}

const LanguageContext = createContext<LangCtx>({ lang: "en", toggle: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("mantle_dna_lang") as Lang | null;
    if (saved === "ja" || saved === "en") setLang(saved);
  }, []);

  const toggle = () => {
    setLang((prev) => {
      const next: Lang = prev === "en" ? "ja" : "en";
      localStorage.setItem("mantle_dna_lang", next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
