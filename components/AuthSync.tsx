"use client";

import { useEffect } from "react";
import { initAuthSync } from "@/lib/supabase/sync";

export default function AuthSync() {
  useEffect(() => {
    initAuthSync();
  }, []);
  return null;
}
