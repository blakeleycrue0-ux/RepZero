"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseEnabled, signOut } from "@/lib/supabase/client";
import { Card, SecondaryButton } from "@/components/ui";

export default function AccountCard() {
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);

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

  if (!supabaseEnabled || userEmail === undefined) return null;

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
      ) : (
        <>
          <p className="mt-1 text-[12px] leading-relaxed text-text-tertiary">Not signed in.</p>
          <Link href="/login">
            <SecondaryButton className="mt-4 !px-4 !py-2 text-[13px]">Log in</SecondaryButton>
          </Link>
        </>
      )}
    </Card>
  );
}
