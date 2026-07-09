"use client";

import { useEffect } from "react";
import { initPwaInstallListener } from "@/lib/pwaInstall";

export default function PwaRegister() {
  useEffect(() => {
    initPwaInstallListener();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // offline shell just won't be available — not fatal
      });
    }
  }, []);
  return null;
}
