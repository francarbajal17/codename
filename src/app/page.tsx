import { GameCreator } from "@/components/game/game-creator";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-5 py-12 sm:px-8">
      <div className="mx-auto grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section>
          <p className="mb-3 text-sm font-bold tracking-[0.2em] text-red-700 uppercase">
            Local word game
          </p>
          <h1 className="max-w-2xl text-5xl leading-none font-black tracking-tight text-slate-950 sm:text-7xl">
            One board. Two teams. Twenty-five clues.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Start a game on the shared computer, then let team leaders scan the
            QR code with their phones.
          </p>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-950">
            Create a new game
          </h2>
          <p className="mt-2 mb-6 text-sm leading-6 text-slate-600">
            No account needed. Games remain available for 24 hours.
          </p>
          <GameCreator />
        </section>
      </div>
    </main>
  );
}
