"use client";

import { useMemo, useState } from "react";
import type { GalleryTemplate } from "./types";
import { compilePrompt, createTemplateValues, filterTemplates } from "./utils";

export function useGalleryController(availableTemplates: GalleryTemplate[]) {
  const [activeCategory, setActiveCategory] = useState("Popular");
  const [selectedId, setSelectedId] = useState(1);
  const [query, setQuery] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [isPromptPreviewOpen, setIsPromptPreviewOpen] = useState(false);
  const [isCoverPreviewOpen, setIsCoverPreviewOpen] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);
  const [isFashionOpen, setIsFashionOpen] = useState(false);

  const selected =
    availableTemplates.find((template) => template.id === selectedId) ?? availableTemplates[0];

  const filteredTemplates = useMemo(
    () => filterTemplates(availableTemplates, activeCategory, query),
    [activeCategory, availableTemplates, query],
  );

  const compiledPrompt = useMemo(() => compilePrompt(selected, values), [selected, values]);

  const selectTemplate = (template: GalleryTemplate) => {
    setSelectedId(template.id);
    setValues(createTemplateValues(template));
  };

  const copyPrompt = async () => {
    if (!selected.prompt) {
      return;
    }

    await navigator.clipboard.writeText(compiledPrompt);
    setIsPromptCopied(true);
    window.setTimeout(() => setIsPromptCopied(false), 2000);
  };

  return {
    activeCategory,
    compiledPrompt,
    copyPrompt,
    filteredTemplates,
    isCoverPreviewOpen,
    isFashionOpen,
    isPromptCopied,
    isPromptPreviewOpen,
    query,
    selected,
    selectTemplate,
    setActiveCategory,
    setIsCoverPreviewOpen,
    setIsFashionOpen,
    setIsPromptPreviewOpen,
    setQuery,
    setValues,
    values,
  };
}
