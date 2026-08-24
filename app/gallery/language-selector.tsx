"use client";

import { useState } from "react";
import { Icon } from "./gallery-icon";
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
        <div className="absolute bottom-full left-0 z-30 mb-2 w-full overflow-hidden rounded-2xl border border-line bg-elevated p-1.5 shadow-xl">
          {languages.map((language) => (
            <button
              key={language.locale}
              type="button"
              onClick={() => {
                onChange(language.locale);
                setIsOpen(false);
              }}
              className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-[13px] transition ${
                locale === language.locale ? "bg-muted font-semibold" : "hover:bg-subtle"
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
        className="flex w-full items-center gap-3 rounded-full border border-line bg-elevated px-4 py-3 text-[13px] font-medium text-ink-soft shadow-sm transition hover:bg-subtle"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Icon name="globe" className="size-5 text-ink-muted" />
        {selectedLanguage.label}
        <Icon
          name="chevron"
          className={`ml-auto size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}
