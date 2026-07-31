"use client";

import type { GalleryCategory } from "./data/gallery-category";
import { ContentTypeSwitch } from "./content-type-switch";
import { Icon } from "./gallery-icon";
import { LanguageSelector } from "./language-selector";
import type { Locale, Translation } from "./i18n";
import type { useGalleryController } from "./use-gallery-controller";

type Controller = ReturnType<typeof useGalleryController>;

type Props = {
  categories: GalleryCategory[];
  controller: Controller;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  t: Translation;
};

export function CategorySidebar({ categories, controller, locale, onLocaleChange: setLocale, t }: Props) {
  const { activeCategory, openCategory, setActiveCategory, setOpenCategory } = controller;
  const mainCategories = categories.filter(({ parentName }) => !parentName);
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
          <ContentTypeSwitch t={t} />
          <nav className="space-y-1" aria-label="Template categories">
            {mainCategories.map(({ name: category, icon, localizedNames }) => {
              const children = categories.filter(({ parentName }) => parentName === category);
              const isOpen = openCategory === category;
              return (
              <div key={category}>
                <button
                  onClick={() => {
                    setActiveCategory(category);
                    setOpenCategory(children.length && !isOpen ? category : null);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition ${
                    activeCategory === category || children.some(({ name }) => name === activeCategory)
                      ? "bg-[#ebe7e0] font-semibold text-black"
                      : "hover:bg-[#f3f0eb]"
                  }`}
                >
                  <span className="flex size-5 items-center justify-center text-[#34312e]">
                    <Icon name={icon ?? "grid"} className="size-4" />
                  </span>
                  {localizedNames?.[locale] ?? category}
                  {children.length > 0 && (
                    <Icon
                      name="chevron"
                      className={`ml-auto size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </button>
                {children.length > 0 && isOpen && (
                  <div className="ml-8 mt-1 space-y-1 border-l border-[#ded8cf] pl-3">
                    {children.map(({ name: subcategory, localizedNames: childNames }) => (
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
                        {childNames?.[locale] ?? subcategory}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )})}
          </nav>
          <div className="mt-auto">
            <LanguageSelector locale={locale} onChange={setLocale} />
          </div>
        </aside>
  );
}
