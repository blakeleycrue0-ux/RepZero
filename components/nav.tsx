"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  IconToday,
  IconScan,
  IconPlan,
  IconCoach,
  IconNutrition,
  IconHabits,
  IconProgress,
  IconMore,
  IconSettings,
} from "@/components/icons";
import { brand } from "@/lib/brand";
import ThemeToggle from "@/components/ThemeToggle";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const PRIMARY: NavItem[] = [
  { href: "/home", label: "Today", icon: IconToday },
  { href: "/scan", label: "Scan", icon: IconScan },
  { href: "/plan", label: "Plan", icon: IconPlan },
  { href: "/coach", label: "Coach", icon: IconCoach },
];

const SECONDARY: NavItem[] = [
  { href: "/nutrition", label: "Nutrition", icon: IconNutrition },
  { href: "/habits", label: "Habits", icon: IconHabits },
  { href: "/progress", label: "Progress", icon: IconProgress },
];

function isActive(pathname: string, href: string) {
  if (href === "/home") return pathname === "/home";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome =
    pathname === "/" || pathname.startsWith("/onboarding");

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav pathname={pathname} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav pathname={pathname} />
    </div>
  );
}

function TopNav({ pathname }: { pathname: string }) {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-border-subtle bg-surface-0/90 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8">
        <Link href="/home" className="font-display text-lg tracking-tight">
          {brand.name}
        </Link>
        <nav className="flex items-center gap-1" aria-label="Primary">
          {[...PRIMARY, ...SECONDARY].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                isActive(pathname, item.href)
                  ? "bg-surface-inverse text-text-inverse"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/settings"
            aria-label="Settings"
            className={`flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle transition-colors hover:border-border-strong ${
              isActive(pathname, "/settings") ? "text-navy-hi" : "text-text-secondary"
            }`}
          >
            <IconSettings width={15} height={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  const items: NavItem[] = [
    ...PRIMARY,
    { href: "/more", label: "More", icon: IconMore },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface-1/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {items.map((item) => {
          const active =
            item.href === "/more"
              ? SECONDARY.some((s) => isActive(pathname, s.href)) ||
                isActive(pathname, "/settings")
              : isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className="flex flex-col items-center gap-1 px-2 py-2.5 text-[11px]"
              >
                <Icon
                  width={20}
                  height={20}
                  className={active ? "text-navy-hi" : "text-text-tertiary"}
                />
                <span className={active ? "font-medium text-text-primary" : "text-text-tertiary"}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export const SECONDARY_NAV_ITEMS = SECONDARY;
