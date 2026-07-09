import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Privacy Policy" };

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-lg text-text-primary">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 2026">
      <section className="flex flex-col gap-2">
        <H>Your photos are never stored</H>
        <p>
          When you run a body scan, your photos are sent directly to our server, forwarded
          in-memory to Claude (Anthropic’s AI) for analysis, and the ratings that come back
          are returned to your device. The photo data is held only in server memory for the
          duration of that single request — it is never written to disk, never saved to a
          database, and never viewed by a person. The moment the response is sent, the buffer
          holding your photos is discarded. Only the resulting muscle-group ratings and notes
          (text, no images) are saved to your progress history, and that saving happens on
          your device, not ours.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <H>What we store, and where</H>
        <p>
          {`${brand.name} is local-first. Your profile, scan ratings, workout plans, weekly schedule, habit logs, and chat history are stored in your browser’s IndexedDB, on your device. We do not run a central database that holds this information — if you clear your browser data or use a different device, it won’t follow you unless you export it yourself from Settings.`}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <H>What we send to our AI provider</H>
        <p>
          To generate scan results, workout plans, nutrition guidance, and coach replies, the
          relevant text (your profile answers, plan, and message) — and, only for scans,
          your photos — is sent to Anthropic’s Claude API for processing. This is the
          minimum needed to generate your result. We do not send this data to any advertising,
          analytics, or data-broker service.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <H>Request logging</H>
        <p>
          For abuse prevention and reliability, our servers log basic request metadata —
          timestamp, which AI feature was used, a coarsely hashed device identifier, response
          status, and latency. We never log the content of your photos, messages, or AI
          responses.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <H>Cookies and tracking</H>
        <p>
          {brand.name} does not use advertising cookies or third-party trackers. Your only
          local preference stored outside IndexedDB is your light/dark theme choice, kept in
          localStorage.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <H>Your data, your control</H>
        <p>
          From Settings, you can export a full copy of everything stored on your device as a
          JSON file, or permanently delete it. Deletion is immediate and irreversible — there
          is no backup copy on our end to restore from, because we never had one.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <H>Age requirement</H>
        <p>
          {brand.name} is intended for users 18 and older, confirmed during onboarding, because
          it analyzes physique photos and generates nutrition guidance.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <H>Contact</H>
        <p>Questions about this policy: {brand.supportEmail}</p>
      </section>
    </LegalLayout>
  );
}
