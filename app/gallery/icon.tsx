import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  close: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  arrow: <><path d="M5 12h14" /><path d="m15 8 4 4-4 4" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  megaphone: <><path d="m3 11 15-6v14L3 13Z" /><path d="M11.5 16 13 21H8l-1.5-6" /></>,
  bag: <><path d="M5 8h14l-1 12H6Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
  share: <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></>,
  camera: <><path d="M4 7h4l1.5-2h5L16 7h4v12H4Z" /><circle cx="12" cy="13" r="3.5" /></>,
  shirt: <path d="m8 4-5 3 3 5 2-1v9h8v-9l2 1 3-5-5-3a4 4 0 0 1-8 0Z" />,
  utensils: <><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M16 3v18M16 3c3 2 4 5 4 8h-4" /></>,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
  monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21M12 3c-2.3 2.5-3.5 5.5-3.5 9S9.7 18.5 12 21" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  crown: <><path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 11H5Z" /><path d="M5 18h14" /></>,
  flame: <path d="M12 22c4 0 7-3 7-7 0-3-1.5-5.5-4.5-8 .2 2-1 3.5-2.2 4.2.2-3.5-1.8-6.5-4.8-9.2.2 4-2.5 6.2-3.3 9.3C3.1 15.5 6 22 12 22Z" />,
  spark: <path d="m12 3 1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8L12 3Zm6 10 .7 2.3L21 16l-2.3.7L18 19l-.7-2.3L15 16l2.3-.7L18 13Z" />,
  chevron: <path d="m8 10 4 4 4-4" />,
};

type IconProps = {
  name: string;
  className?: string;
};

export function Icon({ name, className = "size-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
