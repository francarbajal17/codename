import { GameBoard } from "@/components/game/game-board";
import { LeaderQr } from "@/components/game/leader-qr";
import { StartingTeam } from "@/components/game/starting-team";
import { UnavailableGame } from "@/components/game/unavailable-game";
import { loadPublicGame } from "@/lib/persistence/games";

export const dynamic = "force-dynamic";

export default async function PublicGamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const result = await loadPublicGame(gameId);

  if (result.status === "unavailable") {
    return <UnavailableGame />;
  }

  const game = result.game;
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
        <h1 className="text-xl font-black tracking-tight sm:text-3xl">
          CodeName
        </h1>
        <StartingTeam team={game.startingTeam} />
      </header>
      <GameBoard cards={game.cards} />
      <div className="mt-8 flex justify-center">
        <LeaderQr src={game.qrImagePath} />
      </div>
    </main>
  );
}
