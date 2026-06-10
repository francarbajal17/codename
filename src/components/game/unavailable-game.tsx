import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function UnavailableGame() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-5 text-center">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <p className="text-sm font-bold tracking-[0.18em] text-slate-500 uppercase">
          CodeName
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Game unavailable
        </h1>
        <p className="mt-3 mb-7 leading-7 text-slate-600">
          This link may be incomplete, invalid, or expired. Games remain active
          for 24 hours.
        </p>
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          Start a new game
        </Link>
      </section>
    </main>
  );
}
