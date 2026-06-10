import type { Team } from "@/lib/game/types";

export function StartingTeam({ team }: { team: Team }) {
  const name = team === "red" ? "Red" : "Blue";
  return (
    <p className="text-center text-sm font-semibold tracking-wide text-slate-600 uppercase sm:text-base">
      <span
        aria-hidden="true"
        className={`mr-2 inline-block size-3 rounded-full ${team === "red" ? "bg-red-600" : "bg-blue-600"}`}
      />
      {name} team starts
    </p>
  );
}
