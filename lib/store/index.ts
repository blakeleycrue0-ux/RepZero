import { SyncedStore } from "@/lib/supabase/sync";
import type { DataStore } from "./interface";

let instance: DataStore | null = null;

// Call only from client components/effects — IndexedDB does not exist
// server-side. IndexedDB is always the source of truth the UI reads from;
// SyncedStore additionally mirrors writes to Supabase when a user is signed
// in (see lib/supabase/sync.ts), so signed-out usage is unchanged.
export function getStore(): DataStore {
  if (typeof window === "undefined") {
    throw new Error("getStore() called during server render — guard with useEffect/'use client'");
  }
  if (!instance) instance = new SyncedStore();
  return instance;
}

export type { DataStore } from "./interface";
export * from "./types";
