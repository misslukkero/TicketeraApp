"use client";
import { useI18n, localeNames, Locale } from "./i18n";

export default function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex gap-2 mb-8">
      {(Object.keys(localeNames) as Locale[]).map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className={`px-3 py-1 rounded ${
            locale === loc ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"
          }`}
        >
          {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}
