import { LeaderBoardCardView } from "@/components/game/board-card";
import type { LeaderBoardCard } from "@/lib/game/types";

export function LeaderKey({ cards }: { cards: LeaderBoardCard[] }) {
  return (
    <ol aria-label="Private leader key" className="grid grid-cols-5 gap-1.5">
      {cards.map((card) => (
        <LeaderBoardCardView key={card.position} card={card} />
      ))}
    </ol>
  );
}
