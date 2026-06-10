import type { LeaderBoardCard, PublicBoardCard } from "@/lib/game/types";

export function BoardCard({ card }: { card: PublicBoardCard }) {
  return (
    <li
      data-testid="board-card"
      data-position={card.position}
      className="flex min-h-16 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-1.5 py-2 text-center text-[clamp(0.68rem,1.25vw,1.25rem)] font-extrabold tracking-wide text-slate-900 uppercase shadow-sm sm:min-h-20 sm:px-2 lg:min-h-24"
    >
      {card.word}
    </li>
  );
}

const assignmentStyles = {
  red: "border-red-800 bg-red-600 text-white",
  blue: "border-blue-800 bg-blue-600 text-white",
  neutral: "border-stone-400 bg-stone-200 text-stone-950",
  bomb: "border-slate-950 bg-slate-950 text-white",
};

const assignmentLabels = {
  red: "Red",
  blue: "Blue",
  neutral: "Neutral",
  bomb: "Bomb",
};

const assignmentSymbols = {
  red: "R",
  blue: "B",
  neutral: "N",
  bomb: "!",
};

export function LeaderBoardCardView({ card }: { card: LeaderBoardCard }) {
  return (
    <li
      data-testid="leader-card"
      data-assignment={card.assignment}
      data-word={card.word}
      aria-label={`${card.word}, ${assignmentLabels[card.assignment]}`}
      className={`relative flex min-h-16 items-center justify-center rounded-lg border-2 px-1 py-2 text-center text-[clamp(0.62rem,3vw,0.9rem)] font-extrabold tracking-wide uppercase shadow-sm ${assignmentStyles[card.assignment]}`}
    >
      <span
        aria-hidden="true"
        className="absolute top-1 left-1 rounded bg-black/20 px-1 text-[0.55rem] leading-4"
      >
        {assignmentSymbols[card.assignment]}
      </span>
      {card.word}
    </li>
  );
}
