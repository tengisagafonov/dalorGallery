import { Icon } from "./gallery-icon";
import type { Translation } from "./i18n";

type Props = { t: Translation };

export function ContentTypeSwitch({ t }: Props) {
  return (
    <div className="mb-8 px-1">
      <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-faint">
        {t.contentType}
      </p>
      <div className="grid grid-cols-2 gap-1 rounded-[22px] border border-line bg-elevated p-1.5 shadow-[0_4px_14px_rgba(35,30,24,0.05)]">
        <button
          type="button"
          className="flex min-h-11 items-center justify-center gap-2 rounded-[17px] bg-accent px-3 text-[13px] font-semibold text-on-accent shadow-sm"
          aria-pressed="true"
        >
          <Icon name="camera" className="size-[17px] shrink-0" />
          {t.photo}
        </button>
        <button
          type="button"
          disabled
          className="flex min-h-11 cursor-not-allowed items-center justify-center gap-1.5 rounded-[17px] px-2 text-[13px] font-medium text-ink-faint"
          title={t.videoComingSoon}
        >
          <Icon name="play" className="size-[17px] shrink-0 text-ink-muted" />
          {t.video}
          <span className="rounded-full bg-info-soft px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-info">
            {t.soon}
          </span>
        </button>
      </div>
    </div>
  );
}
