import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowLeft } from "@/components/icons";

export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl px-6 py-8 md:py-12">
      <Link
        href="/more"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary"
      >
        <IconArrowLeft width={14} height={14} /> Back
      </Link>
      <h1 className="font-display text-3xl">{title}</h1>
      <p className="mt-1 text-[12px] text-text-tertiary">Last updated {updated}</p>
      <div className="prose-legal mt-8 flex flex-col gap-6 text-[14px] leading-relaxed text-text-secondary">
        {children}
      </div>
    </div>
  );
}
