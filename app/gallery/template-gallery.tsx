"use client";

import Image from "next/image";
import type { GalleryCategory } from "./data/gallery-category";
import { Icon } from "./gallery-icon";
import type { Locale, Translation } from "./i18n";
import type { GalleryTemplate } from "./types";
import type { useGalleryController } from "./use-gallery-controller";

type Controller = ReturnType<typeof useGalleryController>;

type Props = {
  categories: GalleryCategory[];
  controller: Controller;
  locale: Locale;
  onSelectTemplate: (template: GalleryTemplate) => void;
  t: Translation;
};

export function TemplateGallery({ categories, controller, locale, onSelectTemplate, t }: Props) {
  const { activeCategory, filteredTemplates, query, selected, setActiveCategory, setQuery } = controller;
  const isSearching = query.trim().length > 0;
  const mobileCategories = categories.map(({ name }) => name);
  const categoryLabel = (name: string) =>
    categories.find((category) => category.name === name)?.localizedNames?.[locale]
      ?? name;
  return (
        <section className="min-w-0 px-5 pb-6 pt-3 md:px-7">
          <div className="sticky top-0 z-30 -mx-2 mb-5 bg-[#fbfaf8]/95 px-2 pb-3 pt-1 backdrop-blur lg:hidden">
            {!isSearching && <label className="mt-4 flex items-center gap-3 rounded-full border border-[#ded8cf] bg-white px-4 py-3 shadow-sm">
              <Icon name="search" className="size-5 shrink-0 text-[#403d39]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8c8781]"
                placeholder={t.search}
                aria-label={t.search}
              />
            </label>}
            <label className="flex items-center gap-3 rounded-full border border-[#ded8cf] bg-white px-4 py-3 shadow-sm">
              <Icon name="grid" className="size-5 shrink-0 text-[#403d39]" />
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
                className="min-w-0 flex-1 appearance-none bg-transparent text-sm font-medium outline-none"
                aria-label={t.categoriesHeading}
              >
                {mobileCategories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabel(category)}
                  </option>
                ))}
              </select>
              <Icon name="chevron" className="size-4 shrink-0 text-[#81796f]" />
            </label>
          </div>
          <div className="mb-6">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#9a9186]">01 — Templates</p>
              <h1 className="text-[30px] font-black italic tracking-[-0.04em]">Dalor Gallery</h1>
              <p className="mt-1.5 text-[13px] text-[#746f69]">{t.browse}</p>
            </div>
          </div>

          <label className="mb-9 hidden items-center gap-3 rounded-full border border-[#ded8cf] bg-[#fdfcf9] px-5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] lg:flex">
            <Icon name="search" className="size-5 text-[#403d39]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#8c8781]"
              placeholder={t.search}
              aria-label="Search templates"
            />
          </label>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold">
                {isSearching ? t.searchResults : `${categoryLabel(activeCategory)} ${t.templates}`}
              </h2>
              <span className="rounded-md bg-[#eeeae5] px-2 py-0.5 text-xs text-[#79736c]">{filteredTemplates.length}</span>
            </div>
            {!isSearching && <button className="flex items-center gap-2 text-xs text-[#69635d] hover:text-black">{t.viewAll} <Icon name="arrow" className="size-4" /></button>}
          </div>

          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 xl:grid-cols-4">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="group relative min-w-0 text-left">
                  <button type="button" onClick={() => onSelectTemplate(template)} className={`relative block aspect-[4/4.25] w-full overflow-hidden rounded-[14px] bg-gradient-to-br p-4 text-left shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg ${template.style} ${selected?.id === template.id ? "ring-2 ring-[#171410] ring-offset-2 ring-offset-[#fbfaf8]" : ""}`}>
                    {selected?.id === template.id && (
                      <span className="absolute left-2 top-2 z-10 flex size-5 items-center justify-center rounded-full bg-[#171410] text-xs font-bold text-white ring-2 ring-white">✓</span>
                    )}
                    {template.cover ? (
                      <Image
                        src={template.cover}
                        alt={`${template.localizedTitles?.[locale] ?? template.title} cover`}
                        fill
                        sizes="(min-width: 1280px) 190px, 40vw"
                        className={template.coverFit === "contain" ? "object-contain" : "object-cover"}
                        priority={template.id === 1}
                      />
                    ) : (
                      <>
                        <div className="text-[clamp(14px,1.4vw,24px)] font-semibold leading-none">{template.eyebrow}</div>
                        <div className="mt-1 text-[clamp(18px,2vw,30px)] font-black leading-none tracking-tight">{template.headline}</div>
                        <div className="absolute bottom-4 left-4 max-w-[80%] rounded-full bg-black/20 px-2 py-1 text-[9px] font-bold backdrop-blur-sm">{template.subline}</div>
                        <div className="absolute -bottom-10 -right-8 size-28 rounded-full bg-white/15 blur-sm transition group-hover:scale-110" />
                        <div className="absolute bottom-5 right-4 h-10 w-16 -rotate-12 rounded-[50%] border-[10px] border-black/35 bg-white/10 shadow-xl" />
                      </>
                    )}
                  </button>
                  <h3 className="mt-2 truncate text-[12px] font-semibold">
                    {template.localizedTitles?.[locale] ?? template.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-[#77716b]">
                    {template.localizedCategoryNames?.[locale] ?? categoryLabel(template.category)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#ddd5cc] text-center">
              <p className="font-semibold">
                {t.noTemplates}
              </p>
              <p className="mt-1 text-sm text-[#77716b]">
                {t.searchHint}
              </p>
            </div>
          )}
        </section>
  );
}
