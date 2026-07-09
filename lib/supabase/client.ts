"use client";

import { createClient, type Session } from "@supabase/supabase-js";
import { supabaseEnabled } from "./config";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export { supabaseEnabled };

// Browser-only client. Auth state lives in localStorage via the SDK, same
// spirit as the rest of this app's local-first design — no server session
// handling needed since every page is client-rendered.
export const supabase = supabaseEnabled ? createClient(url as string, anonKey as string) : null;

export async function sendMagicLink(email: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Accounts aren't configured for this deployment." };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
    },
  });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(cb: (session: Session | null) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
