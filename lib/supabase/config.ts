// No "use client" here on purpose — safe to import from Server Components
// (e.g. the landing page) as well as client code.
export const supabaseEnabled = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
