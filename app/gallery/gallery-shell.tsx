"use client";

import { useRef, useState } from "react";
import { CategorySidebar } from "./category-sidebar";
import { PreviewOverlays } from "./preview-overlays";
import { TemplateDetails } from "./template-details";
import { TemplateGallery } from "./template-gallery";
import { templates } from "./template-catalog";
import { getDictionary, type Locale } from "./i18n";
import type { GalleryTemplate } from "./types";
import { useGalleryController } from "./use-gallery-controller";

export function GalleryScreen() {
  const [locale, setLocale] = useState<Locale>("en");
  const controller = useGalleryController(templates);
  const detailsRef = useRef<HTMLElement>(null);
  const t = getDictionary(locale);

  const selectTemplateAndRevealDetails = (template: GalleryTemplate) => {
    controller.selectTemplate(template);

    if (window.matchMedia("(max-width: 1023px)").matches) {
      window.setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  return (
    <main className="min-h-screen bg-[#f1efeb] p-3 text-[#151310] sm:p-4">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1550px] overflow-hidden rounded-[26px] border border-[#ded9d1] bg-[#fbfaf8] shadow-[0_24px_70px_rgba(37,31,24,0.10)] lg:grid-cols-[230px_minmax(0,1fr)_340px]">
        <CategorySidebar controller={controller} locale={locale} onLocaleChange={setLocale} t={t} />
        <TemplateGallery controller={controller} onSelectTemplate={selectTemplateAndRevealDetails} t={t} />
        <TemplateDetails controller={controller} detailsRef={detailsRef} t={t} />
      </div>
      <PreviewOverlays controller={controller} t={t} />
    </main>
  );
}
