export type TemplateField = {
  key: string;
  label: string;
  placeholder: string;
  optional?: boolean;
  type?: "text" | "color";
};

export type GalleryTemplate = {
  id: number;
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
  prompt?: string;
  cover?: string;
  coverFit?: "cover" | "contain";
};
