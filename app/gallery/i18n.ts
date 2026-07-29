import de from "./locales/de.json";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import pa from "./locales/pa.json";
import ru from "./locales/ru.json";

export const dictionaries = { en, de, ru, hi, pa } as const;

export type Locale = keyof typeof dictionaries;
type Dictionary = (typeof dictionaries)[Locale];
export type Translation = Omit<Dictionary, "categories" | "templateDescriptions" | "templateTitles"> & {
  categories: Record<string, string>;
  templateDescriptions: Record<string, string>;
  templateTitles: Record<string, string>;
};

export function getDictionary(locale: Locale): Translation {
  return dictionaries[locale];
}
