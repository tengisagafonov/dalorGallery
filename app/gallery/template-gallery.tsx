"use client";

import type { GalleryCategory } from "./data/gallery-category";
import { GalleryPagination } from "./gallery-pagination";
import { Icon } from "./gallery-icon";
import type { Locale, Translation } from "./i18n";
import { TemplateGrid } from "./template-grid";
import { ThemeToggle } from "./theme-toggle";
import type { GalleryTemplate } from "./types";
import { isAllCategory } from "./utils";
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
  const { activeCategory, currentPage, filteredTemplates, pageTemplates, query, selected, setActiveCategory, setPage, setQuery, totalPages } = controller;
  const isSearching = query.trim().length > 0;
  const mobileCategories = categories.map(({ name }) => name);
  const categoryLabel = (name: string) =>
    categories.find((category) => category.name === name)?.localizedNames?.[locale]
      ?? name;
  const changePage = (page: number) => {
    setPage(page);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };
  // Name der „Alle"-Kategorie aus Strapi übernehmen, damit der Button auch nach
  // einer Umbenennung auf die richtige Kategorie zeigt.
  const allCategory = categories.find(({ name }) => isAllCategory(name))?.name;
  const showViewAll = !isSearching && allCategory !== undefined && !isAllCategory(activeCategory);
  return (
        <section className="min-w-0 px-5 pb-6 pt-3 md:px-7">
          <div className="sticky top-0 z-30 -mx-2 mb-5 bg-surface/95 px-2 pb-3 pt-1 backdrop-blur lg:hidden">
            {!isSearching && <label className="mt-4 flex items-center gap-3 rounded-full border border-line bg-elevated px-4 py-3 shadow-sm">
              <Icon name="search" className="size-5 shrink-0 text-ink-soft" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
                placeholder={t.search}
                aria-label={t.search}
              />
            </label>}
            <div className="flex items-center gap-2">
              <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-line bg-elevated px-4 py-3 shadow-sm">
                <Icon name="grid" className="size-5 shrink-0 text-ink-soft" />
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
                <Icon name="chevron" className="size-4 shrink-0 text-ink-faint" />
              </label>
              <ThemeToggle t={t} />
            </div>
          </div>
          <div className="mb-6">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">01 — Templates</p>
              <h1 className="text-[30px] font-black italic tracking-[-0.04em]">Dalor Gallery</h1>
              <p className="mt-1.5 text-[13px] text-ink-muted">{t.browse}</p>
            </div>
          </div>

          <label className="mb-9 hidden items-center gap-3 rounded-full border border-line bg-surface-raised px-5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] lg:flex">
            <Icon name="search" className="size-5 text-ink-soft" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
              placeholder={t.search}
              aria-label="Search templates"
            />
          </label>

          <div id="template-results" className="mb-4 flex scroll-mt-24 items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold">
                {isSearching ? t.searchResults : `${categoryLabel(activeCategory)} ${t.templates}`}
              </h2>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-ink-muted">{filteredTemplates.length}</span>
            </div>
            {showViewAll && (
              <button
                type="button"
                onClick={() => setActiveCategory(allCategory)}
                className="flex items-center gap-2 text-xs text-ink-muted transition hover:text-ink"
              >
                {t.viewAll} <Icon name="arrow" className="size-4" />
              </button>
            )}
          </div>

          {filteredTemplates.length > 0 ? (
            <>
              <TemplateGrid locale={locale} onSelect={onSelectTemplate} selectedId={selected?.id} templates={pageTemplates} />
              <GalleryPagination currentPage={currentPage} nextLabel={t.nextPage} onPageChange={changePage} previousLabel={t.previousPage} totalPages={totalPages} />
            </>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong text-center">
              <p className="font-semibold">
                {t.noTemplates}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {t.searchHint}
              </p>
            </div>
          )}
        </section>
  );
}
