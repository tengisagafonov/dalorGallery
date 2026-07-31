"use client";

import { useMemo, useState } from "react";
import type { GalleryTemplate } from "./types";
import { compilePrompt, createTemplateValues, filterTemplates } from "./utils";
import { trackAnalytics } from "./analytics";

export function useGalleryController(availableTemplates: GalleryTemplate[], locale: string) {
  const [activeCategory, setActiveCategory] = useState("Popular");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [isPromptPreviewOpen, setIsPromptPreviewOpen] = useState(false);
  const [isCoverPreviewOpen, setIsCoverPreviewOpen] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const selected = availableTemplates.find((template) => template.id === selectedId);

  const filteredTemplates = useMemo(
    () => filterTemplates(availableTemplates, activeCategory, query),
    [activeCategory, availableTemplates, query],
  );

  const compiledPrompt = useMemo(
    () => (selected ? compilePrompt(selected, values) : ""),
    [selected, values],
  );

  const selectTemplate = (template: GalleryTemplate) => {
    if (selectedId === template.id) {
      setSelectedId(null);
      setValues({});
      setIsPromptPreviewOpen(false);
      setIsCoverPreviewOpen(false);
      return;
    }

    setSelectedId(template.id);
    setValues(createTemplateValues(template, locale));
  };

  const copyPrompt = async () => {
    if (!selected?.prompt) {
      return;
    }

    await navigator.clipboard.writeText(compiledPrompt);
    trackAnalytics({ eventType: "prompt_copy", templateId: selected.id, templateKey: selected.analyticsKey, templateTitle: selected.title });
    setIsPromptCopied(true);
    window.setTimeout(() => setIsPromptCopied(false), 2000);
  };

  return {
    activeCategory,
    compiledPrompt,
    copyPrompt,
    filteredTemplates,
    isCoverPreviewOpen,
    openCategory,
    isPromptCopied,
    isPromptPreviewOpen,
    query,
    selected,
    selectTemplate,
    setActiveCategory,
    setIsCoverPreviewOpen,
    setOpenCategory,
    setIsPromptPreviewOpen,
    setQuery,
    setValues,
    values,
  };
}
