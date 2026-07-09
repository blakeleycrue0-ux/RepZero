"use client";

import { useEffect, useState } from "react";
import { supabase, supabaseEnabled, sendMagicLink, signOut } from "@/lib/supabase/client";
import { Card, PrimaryButton, SecondaryButton } from "@/components/ui";
import { brand } from "@/lib/brand";

export default function AccountCard() {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a module-level config flag, not React state
      setUserEmail(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUserEmail(session?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabaseEnabled) return null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    const { error } = await sendMagicLink(email.trim());
    setSending(false);
    if (error) setError(error);
    else setSent(true);
  }

  if (userEmail === undefined) return null;

  return (
    <Card className="mt-4 p-5">
      <h2 className="text-[14px] font-medium">Account</h2>
      {userEmail ? (
        <>
          <p className="mt-1 text-[12px] leading-relaxed text-text-tertiary">
            Signed in as <span className="text-text-secondary">{userEmail}</span>. Your data syncs across
            devices.
          </p>
          <SecondaryButton onClick={() => signOut()} className="mt-4 !px-4 !py-2 text-[13px]">
            Sign out
          </SecondaryButton>
        </>
      ) : sent ? (
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
          Check <span className="font-medium">{email}</span> for a sign-in link. Your local data will sync
          to your account the moment you click it.
        </p>
      ) : (
        <>
          <p className="mt-1 text-[12px] leading-relaxed text-text-tertiary">
            Sign in to back up your data and keep it if you switch devices. {brand.name} still works fully
            without an account — this is optional.
          </p>
          <form onSubmit={handleSend} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-[13px] outline-none focus:border-navy-hi"
            />
            <PrimaryButton type="submit" disabled={sending} className="!px-4 !py-2 text-[13px]">
              {sending ? "Sending…" : "Send sign-in link"}
            </PrimaryButton>
          </form>
          {error && (
            <p role="alert" className="mt-2 text-[12px] text-danger">
              {error}
            </p>
          )}
        </>
      )}
    </Card>
  );
}
