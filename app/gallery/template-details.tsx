"use client";

import Image from "next/image";
import type { Ref } from "react";
import { Icon } from "./gallery-icon";
import type { Locale, Translation } from "./i18n";
import type { useGalleryController } from "./use-gallery-controller";
import { trackAnalytics } from "./analytics";
import { ImageAnalyzer } from "./image-analyzer";

type Controller = ReturnType<typeof useGalleryController>;

type Props = {
  controller: Controller;
  detailsRef: Ref<HTMLElement>;
  locale: Locale;
  t: Translation;
};

export function TemplateDetails({ controller, detailsRef, locale, t }: Props) {
  const { selected, setIsCoverPreviewOpen, setIsPromptPreviewOpen, setValues, values } = controller;
  if (!selected) return null;

  const selectedTitle = selected.localizedTitles?.[locale] ?? selected.title;
  return (
        <aside ref={detailsRef} className="scroll-mt-3 border-t border-[#e5e0d8] bg-[#f8f6f2] p-5 lg:border-l lg:border-t-0">
          <div className="rounded-[22px] border border-[#ded8cf] bg-[#fdfcf9] p-5 shadow-[0_4px_20px_rgba(70,55,40,0.035)]">
            <div className="flex gap-4 border-b border-[#eee8e1] pb-5">
              <button
                type="button"
                onClick={() => selected.cover && setIsCoverPreviewOpen(true)}
                className={`relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br p-3 text-left transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#171410] focus:ring-offset-2 ${selected.style} ${selected.cover ? "cursor-zoom-in" : "cursor-default"}`}
                aria-label={selected.cover ? `Open ${selectedTitle} cover` : undefined}
              >
                {selected.cover ? (
                  <Image
                    src={selected.cover}
                    alt={`${selectedTitle} cover`}
                    fill
                    sizes="96px"
                    className={selected.coverFit === "contain" ? "object-contain" : "object-cover"}
                  />
                ) : (
                  <>
                    <p className="text-lg font-semibold leading-none">{selected.eyebrow}</p>
                    <p className="text-xl font-black leading-none">{selected.headline}</p>
                    <p className="mt-3 text-[8px] font-bold">{selected.subline}</p>
                  </>
                )}
              </button>
              <div className="min-w-0 pt-1">
                <h2 className="text-[15px] font-semibold">{selectedTitle}</h2>
                <span className="mt-2 inline-block rounded-full border border-[#ddd6cd] bg-[#f2eee8] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[#625b53]">
                  {selected.localizedCategoryNames?.[locale] ?? selected.category}
                </span>
                <p className="mt-3 text-[12px] leading-5 text-[#68625c]">
                  {selected.localizedDescriptions?.[locale] ?? selected.description}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsPromptPreviewOpen(true);
                    trackAnalytics({ eventType: "prompt_preview", templateId: selected.id, templateKey: selected.analyticsKey, templateTitle: selected.title });
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#d8d1c8] bg-[#f5f2ed] px-3 py-2 text-[11px] font-semibold text-[#27231f] shadow-sm transition hover:-translate-y-px hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#cfc7bc] focus:ring-offset-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-white">
                      <Icon name="eye" className="size-4" />
                    </span>
                    {t.previewPrompt}
                  </span>
                  <Icon name="arrow" className="size-3.5 text-[#81796f]" />
                </button>
              </div>
            </div>

            <div className="pt-5">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#a1988d]">02 — Customize</p>
              <h3 className="text-[18px] font-black italic tracking-tight">{t.customize}.</h3>
              <p className="mt-1 text-[12px] leading-5 text-[#746e68]">{t.customizeHint}</p>
              <div className="mt-5 space-y-3.5">
                {selected.fields.map((field) => {
                  const label = field.localizedLabels?.[locale] ?? field.label;
                  const placeholder = field.localizedPlaceholders?.[locale] ?? field.placeholder;
                  return (
                  <label key={`${selected.id}-${field.key}`} className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold">
                      {label} {field.optional && <span className="font-normal text-[#8f8880]">(optional)</span>}
                    </span>
                    {field.key === "image_description" && (
                      <ImageAnalyzer
                        t={t}
                        onAnalyzed={(description) =>
                          setValues((current) => ({ ...current, [field.key]: description }))
                        }
                      />
                    )}
                    {field.type === "textarea" ? (
                      <textarea
                        value={values[field.key] ?? placeholder}
                        onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                        rows={4}
                        className="w-full resize-y rounded-xl border border-[#ded8cf] bg-white px-3 py-2.5 text-[12px] leading-5 outline-none focus:border-[#746b61] focus:ring-2 focus:ring-[#e9e4dc]"
                      />
                    ) : <div className="flex items-center gap-2 rounded-xl border border-[#ded8cf] bg-white px-3 py-2.5 focus-within:border-[#746b61] focus-within:ring-2 focus-within:ring-[#e9e4dc]">
                      {field.type === "color" && (
                        <input
                          type="color"
                          value={
                            /^#[0-9A-Fa-f]{6}$/.test(values[field.key] ?? placeholder)
                              ? (values[field.key] ?? placeholder)
                              : "#7b746b"
                          }
                          onChange={(event) =>
                            setValues((current) => ({ ...current, [field.key]: event.target.value.toUpperCase() }))
                          }
                          className="size-6 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
                          aria-label={`Choose ${label.toLowerCase()}`}
                        />
                      )}
                      <input
                        value={values[field.key] ?? placeholder}
                        onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                        className="min-w-0 flex-1 bg-transparent text-[12px] outline-none"
                      />
                    </div>}
                  </label>
                  );
                })}
              </div>
              <p className="mt-6 text-center text-[10px] text-[#827b74]">{t.privacy}</p>
            </div>
          </div>
        </aside>
  );
}
