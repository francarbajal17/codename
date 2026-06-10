"use server";

import { redirect } from "next/navigation";

import { generateGame } from "@/lib/game/generate";
import { createGameId, createLeaderToken } from "@/lib/game/identity";
import { secureRandom } from "@/lib/game/random";
import type { WordListLanguage } from "@/lib/game/types";
import { saveGame } from "@/lib/persistence/games";

export interface CreateGameState {
  error?: string;
}

export async function createGame(
  _previousState: CreateGameState,
  formData: FormData,
): Promise<CreateGameState> {
  const language = formData.get("language");
  if (language !== "en" && language !== "es") {
    return { error: "Choose an English or Spanish word list." };
  }

  let gameId: string;
  try {
    gameId = await createAndPersistGame(language);
  } catch {
    return { error: "The game could not be created. Please try again." };
  }

  redirect(`/games/${gameId}`);
}

async function createAndPersistGame(
  language: WordListLanguage,
): Promise<string> {
  const gameId = createGameId();
  const game = generateGame({
    language,
    gameId,
    leaderToken: createLeaderToken(),
    now: new Date(),
    random: secureRandom,
  });
  await saveGame(game);
  return gameId;
}
