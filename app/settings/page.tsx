"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStore } from "@/lib/store";
import type { Profile } from "@/lib/store/types";
import { Card, SecondaryButton, Spinner } from "@/components/ui";
import ThemeToggle from "@/components/ThemeToggle";
import { installAvailable, onInstallAvailable, promptInstall } from "@/lib/pwaInstall";
import { brand } from "@/lib/brand";

const GOAL_LABELS: Record<string, string> = {
  build_muscle: "Build muscle",
  lose_fat: "Lose fat",
  recomposition: "Recomposition",
  general_health: "General health",
};

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getStore()
      .getProfile()
      .then((p) => {
        setProfile(p);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a module-level flag set by a prior browser event
    setCanInstall(installAvailable());
    return onInstallAvailable(() => setCanInstall(true));
  }, []);

  async function handleExport() {
    setExporting(true);
    try {
      const data = await getStore().exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${brand.short.toLowerCase()}-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete all your Repsette data from this device? This can't be undone."
    );
    if (!confirmed) return;
    setDeleting(true);
    await getStore().deleteAll();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8 md:py-12">
      <h1 className="font-display text-3xl">Settings</h1>

      {profile && (
        <Card className="mt-6 p-5">
          <h2 className="text-[12px] font-medium uppercase tracking-wide text-text-tertiary">Profile</h2>
          <dl className="mt-3 flex flex-col gap-2 text-[13px]">
            <Row label="Goal" value={GOAL_LABELS[profile.goal] ?? profile.goal} />
            <Row label="Experience" value={profile.experience} />
            <Row label="Days per week" value={String(profile.daysPerWeek)} />
            <Row label="Equipment" value={profile.equipment.replace("_", " ")} />
            <Row label="Diet" value={profile.dietPattern} />
            {profile.allergies.length > 0 && <Row label="Avoiding" value={profile.allergies.join(", ")} />}
          </dl>
          <Link href="/onboarding" className="mt-4 inline-block text-[13px] font-medium text-navy-hi underline underline-offset-4">
            Edit profile
          </Link>
        </Card>
      )}

      <Card className="mt-4 flex items-center justify-between p-5">
        <div>
          <h2 className="text-[14px] font-medium">Appearance</h2>
          <p className="text-[12px] text-text-tertiary">Light or dark, your call.</p>
        </div>
        <ThemeToggle />
      </Card>

      {canInstall && (
        <Card className="mt-4 flex items-center justify-between p-5">
          <div>
            <h2 className="text-[14px] font-medium">Install app</h2>
            <p className="text-[12px] text-text-tertiary">Add {brand.name} to your home screen.</p>
          </div>
          <SecondaryButton
            onClick={async () => {
              const accepted = await promptInstall();
              if (accepted) setCanInstall(false);
            }}
            className="!px-4 !py-1.5 text-[13px]"
          >
            Install
          </SecondaryButton>
        </Card>
      )}

      <Card className="mt-4 p-5">
        <h2 className="text-[14px] font-medium">Your data</h2>
        <p className="mt-1 text-[12px] leading-relaxed text-text-tertiary">
          Everything is stored on this device. Export a copy any time, or delete it all.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <SecondaryButton onClick={handleExport} disabled={exporting} className="!px-4 !py-2 text-[13px]">
            {exporting ? "Exporting…" : "Export my data"}
          </SecondaryButton>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full border border-danger/40 px-4 py-2 text-[13px] font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete all data"}
          </button>
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap gap-4 text-[12px] text-text-tertiary">
        <Link href="/legal/privacy" className="hover:text-text-primary">Privacy</Link>
        <Link href="/legal/terms" className="hover:text-text-primary">Terms</Link>
        <Link href="/legal/how-ai-works" className="hover:text-text-primary">How the AI works</Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle pb-2 last:border-none last:pb-0">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}
