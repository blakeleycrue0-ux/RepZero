"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStore } from "@/lib/store";

export default function LandingRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    getStore()
      .getProfile()
      .then((profile) => {
        if (!cancelled && profile) router.replace("/home");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
