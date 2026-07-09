// Minimal hand-drawn line-icon set, one visual language (1.6 stroke, round caps),
// so we never reach for a generic icon-pack look.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconToday(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5.5h4V20" />
    </svg>
  );
}

export function IconScan(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8" />
      <path d="M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8" />
      <path d="M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16" />
      <path d="M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

export function IconPlan(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4.5h14" />
      <path d="M5 9.5h14" />
      <path d="M5 14.5h9" />
      <path d="M5 19.5h6" />
      <path d="M17 14.2l1.4 1.4L21.5 12.5" />
    </svg>
  );
}

export function IconCoach(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12a8 8 0 1 1 3.2 6.4L4 19.5l1.1-3.2A7.96 7.96 0 0 1 4 12Z" />
      <path d="M8.5 11h7M8.5 14h4.5" />
    </svg>
  );
}

export function IconNutrition(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5c-3.6 0-6.2 3.4-6.2 7.6 0 4.5 3 8 6.2 9.4 3.2-1.4 6.2-4.9 6.2-9.4 0-4.2-2.6-7.6-6.2-7.6Z" />
      <path d="M12 3.5c1 1.6 1 3.3 0 4.7" />
    </svg>
  );
}

export function IconHabits(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="4" height="4" rx="0.8" />
      <rect x="10" y="4" width="4" height="4" rx="0.8" />
      <rect x="16" y="4" width="4" height="4" rx="0.8" />
      <rect x="4" y="10" width="4" height="4" rx="0.8" />
      <rect x="10" y="10" width="4" height="4" rx="0.8" />
      <rect x="4" y="16" width="4" height="4" rx="0.8" />
      <path d="M16.5 15.5 15 17l-1.5-1.5" />
    </svg>
  );
}

export function IconProgress(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20V10.5" />
      <path d="M10.5 20V6" />
      <path d="M17 20v-7.5" />
      <path d="M3 20h18" />
    </svg>
  );
}

export function IconMore(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="2.8" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.7 6.3l-1.5 1.5M7.8 16.2l-1.5 1.5M17.7 17.7l-1.5-1.5M7.8 7.8 6.3 6.3" />
    </svg>
  );
}

export function IconCamera(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h1.8l1-1.7h7.4l1 1.7h1.8A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18Z" />
      <circle cx="12" cy="13" r="3.3" />
    </svg>
  );
}

export function IconUpload(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 15.5V4.5" />
      <path d="M8 8.3 12 4.3l4 4" />
      <path d="M5 15.5v3A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-3" />
    </svg>
  );
}

export function IconSend(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 4 10.5 13.5" />
      <path d="M20 4 13.5 20l-3-6.5L4 10.5Z" />
    </svg>
  );
}

export function IconFlame(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3s-1 2.6-1 4.3c0 1.1.7 1.7 1.4 2.4C13.4 8.9 13.5 7 13.5 7s3 2.7 3 6.6A4.5 4.5 0 0 1 12 18a4.5 4.5 0 0 1-4.5-4.4c0-3.3 2.2-5.2 3-6.3.5.9.3 1.9 1 2.3-.1-2 .3-4.6.5-6.6Z" />
    </svg>
  );
}

export function IconShare(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="18" cy="6" r="2.3" />
      <circle cx="6" cy="12" r="2.3" />
      <circle cx="18" cy="18" r="2.3" />
      <path d="m8.1 10.9 7.8-3.6M8.1 13.1l7.8 3.6" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 12.5 9 17l10.5-11" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function IconArrowLeft(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

export function IconBell(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 10.5a6 6 0 1 1 12 0c0 3.6 1 5 1.5 5.8H4.5C5 15.5 6 14.1 6 10.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}
