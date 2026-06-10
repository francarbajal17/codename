import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-5 text-center">
      <section className="w-full">
        <p className="text-sm font-bold tracking-[0.18em] text-slate-500 uppercase">
          404
        </p>
        <h1 className="mt-3 text-4xl font-black">Page not found</h1>
        <p className="mt-3 mb-7 text-slate-600">
          The page you requested does not exist.
        </p>
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          Go to CodeName
        </Link>
      </section>
    </main>
  );
}
