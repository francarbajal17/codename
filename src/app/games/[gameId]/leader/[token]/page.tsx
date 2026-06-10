import Link from "next/link";

import { LeaderKey } from "@/components/game/leader-key";
import { StartingTeam } from "@/components/game/starting-team";
import { UnavailableGame } from "@/components/game/unavailable-game";
import { loadLeaderGame } from "@/lib/persistence/games";

export const dynamic = "force-dynamic";

export default async function LeaderPage({
  params,
}: {
  params: Promise<{ gameId: string; token: string }>;
}) {
  const { gameId, token } = await params;
  const result = await loadLeaderGame(gameId, token);

  if (result.status === "unavailable") {
    return <UnavailableGame />;
  }

  const game = result.game;
  return (
    <main className="mx-auto min-h-screen max-w-xl px-2.5 py-4 sm:px-5">
      <Link
        href={`/games/${game.gameId}`}
        className="inline-flex rounded-md px-2 py-1 text-sm font-semibold text-slate-600 underline underline-offset-4"
      >
        Public board
      </Link>
      <header className="my-4 text-center">
        <p className="text-xs font-bold tracking-[0.18em] text-slate-500 uppercase">
          Private view
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Leader key</h1>
        <div className="mt-2">
          <StartingTeam team={game.startingTeam} />
        </div>
      </header>
      <LeaderKey cards={game.cards} />
      <p className="mt-4 text-center text-xs text-slate-500">
        R red, B blue, N neutral, ! bomb
      </p>
    </main>
  );
}
