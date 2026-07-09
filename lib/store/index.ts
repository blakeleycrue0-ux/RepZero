import { IndexedDbStore } from "./indexeddb";
import type { DataStore } from "./interface";

let instance: DataStore | null = null;

// Call only from client components/effects — IndexedDB does not exist
// server-side. Swap `IndexedDbStore` for a Supabase-backed implementation
// here when accounts + sync ship; nothing above this line needs to change.
export function getStore(): DataStore {
  if (typeof window === "undefined") {
    throw new Error("getStore() called during server render — guard with useEffect/'use client'");
  }
  if (!instance) instance = new IndexedDbStore();
  return instance;
}

export type { DataStore } from "./interface";
export * from "./types";
