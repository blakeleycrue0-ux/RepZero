import Link from "next/link";
import { IconNutrition, IconHabits, IconProgress, IconSettings, IconChevronRight } from "@/components/icons";
import { Card } from "@/components/ui";

const ITEMS = [
  { href: "/nutrition", label: "Nutrition", description: "Daily meal guidance and swap chat", icon: IconNutrition },
  { href: "/habits", label: "Habits", description: "Streaks, heatmap, weekly review", icon: IconHabits },
  { href: "/progress", label: "Progress", description: "Scan history and shareable cards", icon: IconProgress },
  { href: "/settings", label: "Settings", description: "Theme, data export, account", icon: IconSettings },
];

export default function MorePage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-8 md:py-12">
      <h1 className="font-display text-3xl">More</h1>
      <div className="mt-6 flex flex-col gap-3">
        {ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="flex items-center gap-4 p-4 transition-colors hover:border-border-strong">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-secondary">
                <item.icon width={18} height={18} />
              </span>
              <span className="flex-1">
                <span className="block text-[14px] font-medium">{item.label}</span>
                <span className="block text-[12px] text-text-tertiary">{item.description}</span>
              </span>
              <IconChevronRight width={16} height={16} className="text-text-tertiary" />
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-4 text-[12px] text-text-tertiary">
        <Link href="/legal/privacy" className="hover:text-text-primary">Privacy</Link>
        <Link href="/legal/terms" className="hover:text-text-primary">Terms</Link>
        <Link href="/legal/how-ai-works" className="hover:text-text-primary">How the AI works</Link>
      </div>
    </div>
  );
}
