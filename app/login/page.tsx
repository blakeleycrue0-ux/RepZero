"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, supabaseEnabled, signUpWithPassword, signInWithPassword } from "@/lib/supabase/client";
import { PrimaryButton } from "@/components/ui";
import Logo from "@/components/Logo";
import { brand } from "@/lib/brand";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/home");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "signup") {
      if (!name.trim()) return setError("Enter your name.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
      if (password !== confirmPassword) return setError("Passwords don't match.");
    }

    setSubmitting(true);
    if (mode === "signup") {
      const { error, needsConfirmation } = await signUpWithPassword(email.trim(), password, name.trim());
      setSubmitting(false);
      if (error) return setError(error);
      if (needsConfirmation) {
        setNeedsConfirmation(true);
      } else {
        router.replace("/onboarding");
      }
    } else {
      const { error } = await signInWithPassword(email.trim(), password);
      setSubmitting(false);
      if (error) return setError(error);
      router.replace("/home");
    }
  }

  if (needsConfirmation) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-6 text-center">
        <Logo size={30} />
        <h1 className="mt-8 font-display text-2xl">Confirm your email</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">
          We sent a confirmation link to <span className="font-medium text-text-primary">{email}</span>.
          Click it, then come back and log in.
        </p>
        <button
          type="button"
          onClick={() => {
            setNeedsConfirmation(false);
            setMode("login");
          }}
          className="mt-6 text-[13px] font-medium text-navy-hi underline underline-offset-4"
        >
          Back to log in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-12">
      <div className="mb-8 flex justify-center">
        <Logo size={30} />
      </div>

      {!supabaseEnabled ? (
        <p className="text-center text-[14px] text-danger">
          Accounts aren&rsquo;t configured for this deployment yet.
        </p>
      ) : (
        <>
          <div className="mb-6 flex justify-center gap-1">
            {(["signup", "login"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  mode === m ? "bg-surface-inverse text-text-inverse" : "text-text-secondary"
                }`}
              >
                {m === "signup" ? "Create account" : "Log in"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === "signup" && (
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="rounded-xl border border-border-subtle bg-surface-0 px-4 py-3 text-[14px] outline-none focus:border-navy-hi"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="rounded-xl border border-border-subtle bg-surface-0 px-4 py-3 text-[14px] outline-none focus:border-navy-hi"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="rounded-xl border border-border-subtle bg-surface-0 px-4 py-3 text-[14px] outline-none focus:border-navy-hi"
            />
            {mode === "signup" && (
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
                className="rounded-xl border border-border-subtle bg-surface-0 px-4 py-3 text-[14px] outline-none focus:border-navy-hi"
              />
            )}
            <PrimaryButton type="submit" disabled={submitting} className="mt-1 w-full">
              {submitting ? "…" : mode === "signup" ? "Create account" : "Log in"}
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
