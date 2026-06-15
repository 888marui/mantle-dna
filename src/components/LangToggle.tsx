"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function LangToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <button
      onClick={toggle}
      className="px-2.5 py-1 rounded-lg border border-gray-700 text-xs font-medium text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
      title="Switch language / 言語を切り替え"
    >
      {lang === "en" ? "日本語" : "EN"}
    </button>
  );
}
