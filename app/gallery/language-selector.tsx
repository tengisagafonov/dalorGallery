"use client";

import { useState } from "react";
import { Icon } from "./icon";
import type { Locale } from "./i18n";

type LanguageSelectorProps = {
  locale: Locale;
  onChange: (locale: Locale) => void;
};

const languages: Array<{ locale: Locale; label: string }> = [
  { locale: "en", label: "English" },
  { locale: "de", label: "Deutsch" },
  { locale: "ru", label: "Русский" },
  { locale: "hi", label: "हिन्दी" },
  { locale: "pa", label: "ਪੰਜਾਬੀ" },
];

export function LanguageSelector({ locale, onChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage = languages.find((language) => language.locale === locale) ?? languages[0];

  return (
    <div className="relative mt-3">
      {isOpen && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-full overflow-hidden rounded-2xl border border-[#ded7cf] bg-white p-1.5 shadow-xl">
          {languages.map((language) => (
            <button
              key={language.locale}
              type="button"
              onClick={() => {
                onChange(language.locale);
                setIsOpen(false);
              }}
              className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-[13px] transition ${
                locale === language.locale ? "bg-[#ebe7e0] font-semibold" : "hover:bg-[#f5f2ed]"
              }`}
            >
              {language.label}
              {locale === language.locale && <Icon name="check" className="ml-auto size-4" />}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center gap-3 rounded-full border border-[#ded7cf] bg-white px-4 py-3 text-[13px] font-medium text-[#3f3a34] shadow-sm transition hover:bg-[#f8f5f1]"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Icon name="globe" className="size-5 text-[#726a61]" />
        {selectedLanguage.label}
        <Icon
          name="chevron"
          className={`ml-auto size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}
