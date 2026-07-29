"use client";

import Image from "next/image";
import { Icon } from "./icon";
import type { Translation } from "./i18n";
import type { useGalleryController } from "./use-gallery-controller";

type Controller = ReturnType<typeof useGalleryController>;

export function PreviewOverlays({ controller, t }: { controller: Controller; t: Translation }) {
  const { compiledPrompt, copyPrompt, isCoverPreviewOpen, isPromptCopied, isPromptPreviewOpen, selected, setIsCoverPreviewOpen, setIsPromptPreviewOpen } = controller;
  const selectedTitle = t.templateTitles[String(selected.id)] ?? selected.title;
  return (
    <>
      {isPromptPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#151310]/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prompt-preview-title"
          onClick={() => setIsPromptPreviewOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-[24px] border border-[#ded8cf] bg-[#fbfaf8] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e5e0d8] px-6 py-5">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#9a9186]">{t.promptPreview}</p>
                <h2 id="prompt-preview-title" className="mt-1 text-xl font-black italic">{selectedTitle}.</h2>
              </div>
              <button
                onClick={() => setIsPromptPreviewOpen(false)}
                className="rounded-full p-2 hover:bg-[#eee9e2]"
                aria-label={t.closePrompt}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={copyPrompt}
                disabled={!selected.prompt}
                className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-[#ded8cf] bg-[#fbfaf8]/95 px-3 py-2 text-[11px] font-semibold shadow-sm backdrop-blur transition hover:bg-[#eee9e2] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#fbfaf8]"
                aria-label={selected.prompt ? t.copy : t.noPrompt}
              >
                <Icon name={isPromptCopied ? "check" : "copy"} className="size-4" />
                {selected.prompt ? (isPromptCopied ? t.copied : t.copy) : t.noPrompt}
              </button>
              <pre className="max-h-[65vh] overflow-auto whitespace-pre-wrap p-6 pr-28 font-mono text-[12px] leading-6 text-[#3f3a34]">
                {compiledPrompt}
              </pre>
            </div>
          </div>
        </div>
      )}

      {isCoverPreviewOpen && selected.cover && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#151310]/75 p-5 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedTitle} cover preview`}
          onClick={() => setIsCoverPreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsCoverPreviewOpen(false)}
            className="absolute right-5 top-5 rounded-full border border-white/25 bg-black/25 p-3 text-white transition hover:bg-black/50"
            aria-label="Close cover preview"
          >
            <Icon name="close" />
          </button>
          <div
            className="relative h-[88vh] w-full max-w-[520px] overflow-hidden rounded-[22px] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selected.cover}
              alt={`${selectedTitle} large cover preview`}
              fill
              sizes="(max-width: 640px) 90vw, 520px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
