"use client";

import { categories, categoryIcons, fashionSubcategories } from "./config";
import { Icon } from "./icon";
import { LanguageSelector } from "./language-selector";
import type { Locale, Translation } from "./i18n";
import type { useGalleryController } from "./use-gallery-controller";

type Controller = ReturnType<typeof useGalleryController>;

type Props = { controller: Controller; locale: Locale; onLocaleChange: (locale: Locale) => void; t: Translation };

export function CategorySidebar({ controller, locale, onLocaleChange: setLocale, t }: Props) {
  const { activeCategory, isFashionOpen, setActiveCategory, setIsFashionOpen } = controller;
  return (
        <aside className="hidden border-r border-[#e5e0d8] bg-[#fdfcf9] px-4 py-6 lg:flex lg:flex-col">
          <div className="mb-9 flex items-center gap-3 px-3">
            <span className="relative block size-6 overflow-hidden rounded-full bg-[#171410]">
              <span className="absolute -right-1 top-0 size-6 rounded-full border border-[#d7d1c8] bg-[#fdfcf9]" />
            </span>
            <span className="text-[21px] font-semibold tracking-tight">
              Dalor<span className="font-serif font-normal italic text-[#6f685f]">Studio</span>
            </span>
          </div>
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#99928a]">{t.categoriesHeading}</p>
          <nav className="space-y-1" aria-label="Template categories">
            {categories.map((category) => (
              <div key={category}>
                <button
                  onClick={() => {
                    setActiveCategory(category);
                    if (category === "Fashion") {
                      setIsFashionOpen((current) => !current);
                    }
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition ${
                    activeCategory === category || (category === "Fashion" && fashionSubcategories.includes(activeCategory))
                      ? "bg-[#ebe7e0] font-semibold text-black"
                      : "hover:bg-[#f3f0eb]"
                  }`}
                >
                  <span className="flex size-5 items-center justify-center text-[#34312e]">
                    <Icon name={categoryIcons[category]} className="size-4" />
                  </span>
                  {t.categories[category]}
                  {category === "Fashion" && (
                    <Icon
                      name="chevron"
                      className={`ml-auto size-4 transition-transform ${isFashionOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </button>
                {category === "Fashion" && isFashionOpen && (
                  <div className="ml-8 mt-1 space-y-1 border-l border-[#ded8cf] pl-3">
                    {fashionSubcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        type="button"
                        onClick={() => setActiveCategory(subcategory)}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-[12px] transition ${
                          activeCategory === subcategory
                            ? "bg-[#ebe7e0] font-semibold text-black"
                            : "text-[#706a63] hover:bg-[#f3f0eb] hover:text-black"
                        }`}
                      >
                        {t.categories[subcategory]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="mt-auto">
            <LanguageSelector locale={locale} onChange={setLocale} />
          </div>
        </aside>
  );
}
