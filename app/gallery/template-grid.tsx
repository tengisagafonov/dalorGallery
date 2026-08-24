import Image from "next/image";
import type { Locale } from "./i18n";
import type { GalleryTemplate } from "./types";

type Props = {
  locale: Locale;
  onSelect: (template: GalleryTemplate) => void;
  selectedId?: number;
  templates: GalleryTemplate[];
};

export function TemplateGrid({ locale, onSelect, selectedId, templates }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5 xl:grid-cols-4">
      {templates.map((template, index) => (
        <div key={template.id} className="group relative min-w-0 text-left">
          <button
            type="button"
            onClick={() => onSelect(template)}
            className={`relative block aspect-[4/4.25] w-full overflow-hidden rounded-[14px] bg-gradient-to-br p-4 text-left shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg ${template.style} ${selectedId === template.id ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""}`}
          >
            {selectedId === template.id && (
              <span className="absolute left-2 top-2 z-10 flex size-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-accent ring-2 ring-surface">✓</span>
            )}
            {template.cover ? (
              <Image
                src={template.cover}
                alt={`${template.localizedTitles?.[locale] ?? template.title} cover`}
                fill
                sizes="(min-width: 1280px) 190px, 40vw"
                className={template.coverFit === "contain" ? "object-contain" : "object-cover"}
                priority={index === 0}
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
          <p className="mt-0.5 text-[11px] text-ink-muted">
            {template.localizedCategoryNames?.[locale] ?? template.category}
          </p>
        </div>
      ))}
    </div>
  );
}
