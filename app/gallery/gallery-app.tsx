"use client";

import { GalleryScreen } from "./gallery-shell";
import type { GalleryCategory } from "./data/gallery-category";
import type { GalleryTemplate } from "./types";

type Props = {
  strapiCategories: GalleryCategory[];
  strapiTemplates: GalleryTemplate[];
};

export function GalleryClient({ strapiCategories, strapiTemplates }: Props) {
  return <GalleryScreen strapiCategories={strapiCategories} strapiTemplates={strapiTemplates} />;
}
