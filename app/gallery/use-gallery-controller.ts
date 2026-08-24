"use client";

import { useMemo, useState } from "react";
import type { GalleryTemplate } from "./types";
import { compilePrompt, createTemplateValues, filterTemplates } from "./utils";
import { fetchTemplatePrompt } from "./data/prompt-client";
import { trackAnalytics } from "./analytics";

export function useGalleryController(availableTemplates: GalleryTemplate[], locale: string) {
  const [activeCategory, setActiveCategoryState] = useState("Popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQueryState] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [isPromptPreviewOpen, setIsPromptPreviewOpen] = useState(false);
  const [isCoverPreviewOpen, setIsCoverPreviewOpen] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  // Nachgeladene Prompts, je Template einmal. Siehe data/prompt-client.ts
  const [prompts, setPrompts] = useState<Record<number, string | null>>({});

  const selected = availableTemplates.find((template) => template.id === selectedId);
  const prompt = selected ? prompts[selected.id] : undefined;
  const isPromptLoading = Boolean(selected?.hasPrompt) && prompt === undefined;

  const filteredTemplates = useMemo(
    () => filterTemplates(availableTemplates, activeCategory, query),
    [activeCategory, availableTemplates, query],
  );
  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / 20));
  const safePage = Math.min(currentPage, totalPages);
  const pageTemplates = useMemo(
    () => filteredTemplates.slice((safePage - 1) * 20, safePage * 20),
    [filteredTemplates, safePage],
  );

  const compiledPrompt = useMemo(
    () => (selected && prompt ? compilePrompt({ ...selected, prompt }, values) : ""),
    [prompt, selected, values],
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

    if (prompts[template.id] === undefined) {
      void fetchTemplatePrompt(template)
        .catch(() => null)
        .then((loaded) => setPrompts((current) => ({ ...current, [template.id]: loaded })));
    }
  };

  const setActiveCategory = (category: string) => {
    setActiveCategoryState(category);
    setCurrentPage(1);
  };

  const setQuery = (search: string) => {
    setQueryState(search);
    setCurrentPage(1);
  };

  const copyPrompt = async () => {
    if (!selected || !compiledPrompt) {
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
    currentPage: safePage,
    filteredTemplates,
    isCoverPreviewOpen,
    openCategory,
    pageTemplates,
    isPromptCopied,
    isPromptLoading,
    isPromptPreviewOpen,
    query,
    selected,
    selectTemplate,
    setActiveCategory,
    setIsCoverPreviewOpen,
    setOpenCategory,
    setIsPromptPreviewOpen,
    setQuery,
    setPage: (page: number) => setCurrentPage(Math.min(Math.max(page, 1), totalPages)),
    setValues,
    values,
    totalPages,
  };
}
