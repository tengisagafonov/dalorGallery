"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./gallery-icon";
import type { Locale, Translation } from "./i18n";
import type { GalleryTemplate } from "./types";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://127.0.0.1:1337";
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type Props = {
  locale: Locale;
  onAnalyzed: (description: string) => void;
  t: Translation;
  template: GalleryTemplate;
};

/** Antwort des Backends, wenn das Motiv nicht zur Vorlage gehört. */
type MismatchDetails = { reason?: string; detected?: string; expected?: string };

export function ImageAnalyzer({ locale, onAnalyzed, t, template }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); };
  }, []);

  const analyze = async (image: File) => {
    if (!ACCEPTED_TYPES.includes(image.type) || image.size > 10 * 1024 * 1024) {
      setError(t.imageUploadInvalid);
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    const form = new FormData();
    form.append("image", image);
    // Vorlage und Sprache mitschicken: das Backend prüft damit, ob das Motiv
    // überhaupt zu dieser Vorlage gehört, und benennt die Abweichung passend.
    if (template.promptId) form.append("templateId", template.promptId);
    // Titel und Kategorie als Rückfall: findet das Backend die Vorlage über die
    // Kennung nicht, hätte es sonst nichts zum Vergleichen und würde alles durchlassen.
    form.append("templateTitle", template.title);
    form.append("templateDescription", template.description);
    form.append("locale", locale);
    try {
      const response = await fetch(`${STRAPI_URL}/api/image-analysis`, { method: "POST", body: form });
      const payload = await response.json() as {
        description?: string;
        error?: { message?: string; details?: MismatchDetails };
      };

      if (payload.error?.details?.reason === "subject-mismatch") {
        const { detected, expected } = payload.error.details;
        setError(
          [t.imageDoesNotFit, detected && `${t.imageDetected}: ${detected}`, expected && `${t.imageExpected}: ${expected}`]
            .filter(Boolean)
            .join(" · "),
        );
        setStatus("error");
        return;
      }

      if (!response.ok || !payload.description) throw new Error(payload.error?.message ?? t.imageAnalysisFailed);
      onAnalyzed(payload.description);
      setStatus("idle");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.imageAnalysisFailed);
      setStatus("error");
    }
  };

  const selectFile = (image?: File) => {
    if (!image) return;
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = URL.createObjectURL(image);
    setPreview(previewRef.current);
    setFile(image);
    void analyze(image);
  };

  const remove = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = "";
    setPreview("");
    setFile(null);
    setError("");
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mb-2 rounded-xl border border-dashed border-line-strong bg-surface-sunken p-3">
      <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(",")} hidden onChange={(event) => selectFile(event.target.files?.[0])} />
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files[0]); }}
        className="flex items-center gap-3"
      >
        {preview ? (
          <div className="size-14 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${preview})` }} role="img" aria-label={t.uploadedImage} />
        ) : <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-elevated text-ink-muted shadow-sm"><Icon name="camera" className="size-5" /></span>}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold">{status === "loading" ? t.analyzingImage : t.uploadReferenceImage}</p>
          <p className="mt-0.5 text-[9px] leading-4 text-ink-faint">{t.imageUploadHint}</p>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={status === "loading"} className="rounded-full bg-accent px-3 py-1.5 text-[10px] font-semibold text-on-accent disabled:opacity-50">{file ? t.changeImage : t.uploadImage}</button>
        {file && <button type="button" onClick={() => void analyze(file)} disabled={status === "loading"} className="rounded-full border border-line-strong bg-elevated px-3 py-1.5 text-[10px] font-semibold disabled:opacity-50">{t.analyzeAgain}</button>}
        {file && <button type="button" onClick={remove} disabled={status === "loading"} className="px-2 py-1.5 text-[10px] font-medium text-ink-muted disabled:opacity-50">{t.removeImage}</button>}
      </div>
      {status === "loading" && <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted"><span className="block h-full w-1/2 animate-pulse rounded-full bg-info" /></div>}
      {error && <p className="mt-2 text-[10px] leading-4 text-red-600">{error}</p>}
    </div>
  );
}
