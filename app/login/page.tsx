"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, supabaseEnabled, sendMagicLink } from "@/lib/supabase/client";
import { PrimaryButton } from "@/components/ui";
import Logo from "@/components/Logo";
import { brand } from "@/lib/brand";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/home");
    });
  }, [router]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    const { error } = await sendMagicLink(email.trim());
    setSending(false);
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-12">
      <div className="mb-10 flex justify-center">
        <Logo size={30} />
      </div>

      {!supabaseEnabled ? (
        <p className="text-center text-[14px] text-danger">
          Accounts aren&rsquo;t configured for this deployment yet.
        </p>
      ) : sent ? (
        <div className="text-center">
          <h1 className="font-display text-2xl">Check your email</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">
            We sent a sign-in link to <span className="font-medium text-text-primary">{email}</span>.
            Open it on this device to continue.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-6 text-[13px] font-medium text-navy-hi underline underline-offset-4"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-center font-display text-2xl">Sign in to {brand.name}</h1>
          <p className="mt-2 text-center text-[14px] leading-relaxed text-text-secondary">
            No password — we&rsquo;ll email you a link. Your data stays tied to this account across
            every device.
          </p>
          <form onSubmit={handleSend} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl border border-border-subtle bg-surface-0 px-4 py-3 text-[14px] outline-none focus:border-navy-hi"
            />
            <PrimaryButton type="submit" disabled={sending} className="w-full">
              {sending ? "Sending…" : "Send sign-in link"}
            </PrimaryButton>
          </form>
          {error && (
            <p role="alert" className="mt-3 text-center text-[13px] text-danger">
              {error}
            </p>
          )}
        </>
      )}

      <p className="mt-10 text-center text-[12px] text-text-tertiary">
        <Link href="/" className="underline underline-offset-2">
          Back to {brand.name}
        </Link>
      </p>
    </div>
  );
}
