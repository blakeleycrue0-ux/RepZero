"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a module-level config flag, not React state
      setError("Accounts aren't configured for this deployment.");
      return;
    }
    const client = supabase;
    // The Supabase client auto-detects the magic-link tokens in the URL on
    // load; we just need to wait for the session to land, then move on.
    let cancelled = false;
    const check = async () => {
      const { data } = await client.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        router.replace("/home");
      } else {
        setTimeout(check, 300);
      }
    };
    const timeout = setTimeout(() => {
      if (!cancelled) setError("That link may have expired. Try signing in again.");
    }, 8000);
    check();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      {error ? (
        <>
          <p className="text-[14px] text-danger">{error}</p>
          <a href="/settings" className="text-[13px] font-medium text-navy-hi underline underline-offset-4">
            Back to settings
          </a>
        </>
      ) : (
        <>
          <Spinner className="text-text-tertiary" />
          <p className="text-[13px] text-text-secondary">Signing you in…</p>
        </>
      )}
    </div>
  );
}
