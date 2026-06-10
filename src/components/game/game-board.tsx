import { BoardCard } from "@/components/game/board-card";
import type { PublicBoardCard } from "@/lib/game/types";

export function GameBoard({ cards }: { cards: PublicBoardCard[] }) {
  return (
    <ol aria-label="Word board" className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
      {cards.map((card) => (
        <BoardCard key={card.position} card={card} />
      ))}
    </ol>
  );
}
