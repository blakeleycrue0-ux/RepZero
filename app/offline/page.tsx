import { brand } from "@/lib/brand";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl">You’re offline</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">
        {brand.name} needs a connection for scans, plans, and coaching. Your saved profile,
        plan, and habits are still here — reconnect to pick back up.
      </p>
    </div>
  );
}
