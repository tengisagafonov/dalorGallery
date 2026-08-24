export type TemplateField = {
  key: string;
  label: string;
  placeholder: string;
  /** Platzhalter ist ein Beispieltext – nur als grauer Hinweis anzeigen, nie in den Prompt einsetzen. */
  placeholderIsExample?: boolean;
  optional?: boolean;
  type?: "text" | "textarea" | "color";
  localizedLabels?: Record<string, string>;
  localizedPlaceholders?: Record<string, string>;
};

export type GalleryTemplate = {
  id: number;
  analyticsKey: string;
  title: string;
  category: string;
  subcategory?: string;
  description: string;
  keywords?: string[];
  eyebrow: string;
  headline: string;
  subline: string;
  style: string;
  fields: TemplateField[];
  /**
   * Prompts werden nicht mit der Galerie ausgeliefert, sondern erst beim Auswählen
   * über /api/templates/:promptId/prompt nachgeladen.
   */
  promptId?: string;
  hasPrompt?: boolean;
  prompt?: string;
  cover?: string;
  coverFit?: "cover" | "contain";
  trending?: boolean;
  popular?: boolean;
  popularityRank?: number;
  localizedTitles?: Record<string, string>;
  localizedDescriptions?: Record<string, string>;
  localizedCategoryNames?: Record<string, string>;
};
