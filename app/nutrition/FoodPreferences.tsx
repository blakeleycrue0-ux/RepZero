"use client";

import { useState } from "react";
import { getStore } from "@/lib/store";
import type { Profile } from "@/lib/store/types";
import { PrimaryButton } from "@/components/ui";
import Logo from "@/components/Logo";

export default function FoodPreferences({
  profile,
  onDone,
}: {
  profile: Profile;
  onDone: (profile: Profile) => void;
}) {
  const [likes, setLikes] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const updated: Profile = {
      ...profile,
      foodLikes: likes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      foodDislikes: dislikes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    await getStore().saveProfile(updated);
    setSaving(false);
    onDone(updated);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-2 py-8">
      <div className="mb-6 flex justify-center">
        <Logo size={26} />
      </div>
      <h1 className="text-center font-display text-2xl">Before we build your meals</h1>
      <p className="mt-2 text-center text-[14px] leading-relaxed text-text-secondary">
        A couple of quick preferences so the guidance actually fits what you&rsquo;ll eat. Skip
        either field if nothing comes to mind.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="likes" className="block text-[13px] font-medium text-text-secondary">
            Foods you like / eat often
          </label>
          <input
            id="likes"
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            placeholder="e.g. chicken, rice, eggs, greek yogurt"
            className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-0 px-4 py-3 text-[14px] outline-none focus:border-navy-hi"
          />
        </div>
        <div>
          <label htmlFor="dislikes" className="block text-[13px] font-medium text-text-secondary">
            Foods you dislike or want to avoid
          </label>
          <input
            id="dislikes"
            value={dislikes}
            onChange={(e) => setDislikes(e.target.value)}
            placeholder="e.g. mushrooms, seafood, cottage cheese"
            className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-0 px-4 py-3 text-[14px] outline-none focus:border-navy-hi"
          />
        </div>
        <PrimaryButton type="submit" disabled={saving} className="mt-1 w-full">
          {saving ? "Saving…" : "Continue"}
        </PrimaryButton>
      </form>
    </div>
  );
}
