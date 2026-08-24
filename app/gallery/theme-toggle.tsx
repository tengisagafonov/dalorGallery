"use client";

import type { Translation } from "./i18n";

const STORAGE_KEY = "dalor-theme";

/**
 * Schaltet zwischen hellem und dunklem Theme.
 *
 * Der Zustand lebt bewusst im `data-theme`-Attribut am <html> und nicht in React-State:
 * das Inline-Script im Layout setzt es bereits vor dem ersten Paint, und beide Symbole
 * sind immer im Markup (per CSS ein-/ausgeblendet). Dadurch kann beim Hydrieren nichts
 * auseinanderlaufen und es gibt kein Aufblitzen.
 */
export function ThemeToggle({ className = "", t }: { className?: string; t: Translation }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";

    root.setAttribute("data-theme-switching", "");
    root.setAttribute("data-theme", next);
    window.setTimeout(() => root.removeAttribute("data-theme-switching"), 240);

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Privater Modus o. Ä. – das Theme gilt dann nur für diese Sitzung.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={t.toggleTheme}
      aria-label={t.toggleTheme}
      className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-elevated text-ink-soft shadow-sm transition hover:border-line-hover hover:text-ink ${className}`}
    >
      <svg
        className="theme-icon-moon size-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />
      </svg>
      <svg
        className="theme-icon-sun size-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </svg>
    </button>
  );
}
