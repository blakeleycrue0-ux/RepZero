"use client";

import { useEffect, useState } from "react";
import { getStore } from "@/lib/store";
import type { ChatMessage, Profile, WorkoutPlan } from "@/lib/store/types";
import { Spinner } from "@/components/ui";
import Chat from "@/components/Chat";
import { brand } from "@/lib/brand";

const SUGGESTIONS = [
  "I can't do barbell squats today — what's a good swap?",
  "Is my rest between sets too short?",
  "How do I know if I'm progressing?",
  "My knee feels off on leg day — what should I do?",
];

export default function CoachPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [thread, setThread] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const store = getStore();
    Promise.all([store.getProfile(), store.latestPlan(), store.getCoachThread()]).then(([p, pl, t]) => {
      setProfile(p);
      setPlan(pl);
      setThread(t);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full min-h-[80dvh] max-w-2xl flex-col px-6 py-6 md:py-8">
      <h1 className="mb-4 font-display text-2xl">Coach</h1>
      <Chat
        initialMessages={thread}
        endpoint="/api/coach"
        buildBody={(messages) => ({ profile, planSummary: plan?.summary ?? null, messages })}
        onPersist={(messages) => {
          setThread(messages);
          getStore().saveCoachThread(messages);
        }}
        emptyTitle="Ask your coach anything"
        emptyDescription={`${brand.name} knows your profile and current plan, so answers stay specific to you.`}
        suggestions={SUGGESTIONS}
        placeholder="Ask about form, swaps, recovery…"
      />
    </div>
  );
}
