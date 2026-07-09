"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStore } from "@/lib/store";
import { supabase, supabaseEnabled } from "@/lib/supabase/client";

export default function LandingRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    if (supabaseEnabled && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (!cancelled && data.session) router.replace("/home");
      });
    } else {
      // No accounts configured for this deployment — fall back to local-only.
      getStore()
        .getProfile()
        .then((profile) => {
          if (!cancelled && profile) router.replace("/home");
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
