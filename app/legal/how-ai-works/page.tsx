import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "How the AI works" };

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-lg text-text-primary">{children}</h2>;
}

export default function HowAiWorksPage() {
  return (
    <LegalLayout title="How the AI works, and its limits" updated="July 2026">
      <section className="flex flex-col gap-2">
        <H>Body scan</H>
        <p>
          Your photos are sent to Claude, Anthropic’s AI model, which estimates visible
          muscle development for ten muscle groups and returns a rating of developing, solid,
          or strong for each — never a numeric score, never a comment on weight or body fat.
          It’s a visual estimate meant to point you toward where to focus training next,
          not a body-composition or medical measurement. Lighting, camera angle, clothing, and
          photo quality all affect the read, and two scans of the same body can come back
          slightly differently.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <H>Workout plan and nutrition guidance</H>
        <p>
          Your plan and nutrition guidance are generated from your onboarding profile (goal,
          experience, equipment, days per week, dietary pattern) and, if available, your scan
          priorities. The model follows a set of rules — respecting your equipment, keeping
          nutrition within safe calorie floors, never suggesting extreme restriction — but it
          can still make mistakes or suggest something that isn’t quite right for you.
          Review what it generates before following it, and adjust freely; the plan is editable
          for exactly this reason.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <H>Coach and nutrition chat</H>
        <p>
          Chat responses are generated live, with your profile and current plan as context so
          answers are specific to you. The coach is instructed to encourage safe training and
          good form, to point toward a doctor or physical therapist for anything that sounds
          like pain or injury, and to never recommend supplements or performance-enhancing
          substances. It is still an AI system, not a licensed trainer or clinician.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <H>Where this shouldn’t replace a professional</H>
        <p>
          If you have a diagnosed health condition, an eating disorder history, an injury, or
          are pregnant, talk to a doctor, registered dietitian, or physical therapist before
          following AI-generated guidance. {brand.name} is built to be supportive and
          conservative, but it cannot examine you, take your full medical history, or replace
          individualized professional care.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <H>Model</H>
        <p>{brand.name} uses Anthropic’s Claude models for all AI features.</p>
      </section>
    </LegalLayout>
  );
}
