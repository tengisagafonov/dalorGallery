"use client";

import { useEffect, useRef, useState } from "react";
import { trackAnalytics } from "./analytics";
import { CategorySidebar } from "./category-sidebar";
import { PreviewOverlays } from "./preview-overlays";
import { TemplateDetails } from "./template-details";
import { TemplateGallery } from "./template-gallery";
import { getDictionary, type Locale } from "./i18n";
import type { GalleryTemplate } from "./types";
import { useGalleryController } from "./use-gallery-controller";
import type { GalleryCategory } from "./data/gallery-category";

type Props = {
  strapiCategories: GalleryCategory[];
  strapiTemplates: GalleryTemplate[];
};

export function GalleryScreen({ strapiCategories, strapiTemplates }: Props) {
  const [locale, setLocale] = useState<Locale>("en");
  const controller = useGalleryController(strapiTemplates, locale);
  const detailsRef = useRef<HTMLElement>(null);
  const t = getDictionary(locale);
  const categories = strapiCategories;

  useEffect(() => {
    trackAnalytics({ eventType: "page_view" });
  }, []);

  const selectTemplateAndRevealDetails = (template: GalleryTemplate) => {
    const isDeselecting = controller.selected?.id === template.id;
    controller.selectTemplate(template);

    if (isDeselecting) {
      return;
    }

    trackAnalytics({ eventType: "template_select", templateId: template.id, templateKey: template.analyticsKey, templateTitle: template.title });

    if (window.matchMedia("(max-width: 1023px)").matches) {
      window.setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  return (
    <main className="min-h-screen bg-[#f1efeb] p-3 text-[#151310] sm:p-4">
      <div className={`mx-auto grid min-h-[calc(100vh-24px)] max-w-[1550px] overflow-hidden rounded-[26px] border border-[#ded9d1] bg-[#fbfaf8] shadow-[0_24px_70px_rgba(37,31,24,0.10)] ${controller.selected ? "lg:grid-cols-[270px_minmax(0,1fr)_340px]" : "lg:grid-cols-[270px_minmax(0,1fr)]"}`}>
        <CategorySidebar categories={categories} controller={controller} locale={locale} onLocaleChange={setLocale} t={t} />
        <TemplateGallery categories={categories} controller={controller} locale={locale} onSelectTemplate={selectTemplateAndRevealDetails} t={t} />
        {controller.selected && <TemplateDetails controller={controller} detailsRef={detailsRef} locale={locale} t={t} />}
      </div>
      <PreviewOverlays controller={controller} locale={locale} t={t} />
    </main>
  );
}
