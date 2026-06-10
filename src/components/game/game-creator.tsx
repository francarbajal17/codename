"use client";

import { useActionState } from "react";

import { createGame, type CreateGameState } from "@/app/actions/games";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const initialState: CreateGameState = {};

export function GameCreator() {
  const [state, action, pending] = useActionState(createGame, initialState);

  return (
    <form action={action} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-700">
          Word list language
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <LanguageOption value="en" label="English" defaultChecked />
          <LanguageOption value="es" label="Spanish" />
        </div>
      </fieldset>

      {state.error ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-12 w-full rounded-xl text-base"
      >
        {pending ? "Creating game..." : "Start game"}
      </Button>
    </form>
  );
}

function LanguageOption({
  value,
  label,
  defaultChecked = false,
}: {
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-slate-200 px-4 py-4 font-semibold transition-colors hover:border-slate-400 has-checked:border-slate-950 has-checked:bg-slate-950 has-checked:text-white">
      <input
        className="sr-only"
        type="radio"
        name="language"
        value={value}
        defaultChecked={defaultChecked}
      />
      {label}
    </label>
  );
}
