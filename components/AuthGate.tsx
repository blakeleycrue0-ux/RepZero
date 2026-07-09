"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase, supabaseEnabled } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui";

const PUBLIC_PATHS = new Set(["/", "/login", "/auth/callback"]);

function isPublic(pathname: string) {
  return PUBLIC_PATHS.has(pathname) || pathname.startsWith("/legal/");
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!supabase) {
      // Accounts not configured for this deployment — don't lock the app out.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a module-level config flag, not React state
      setSignedIn(true);
      setReady(true);
      return;
    }
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSignedIn(!!data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabaseEnabled || !ready) return;
    if (!signedIn && !isPublic(pathname)) {
      router.replace("/login");
    }
  }, [ready, signedIn, pathname, router]);

  if (supabaseEnabled && !isPublic(pathname) && (!ready || !signedIn)) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="text-text-tertiary" />
      </div>
    );
  }

  return <>{children}</>;
}
