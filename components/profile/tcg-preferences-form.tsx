"use client";

import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";

import { updateUserTcgPreferencesAction } from "@/app/profile/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type GameOption = {
  id: string;
  name: string;
  slug: string;
};

type TcgPreferencesFormProps = {
  games: GameOption[];
  initialSelectedGameIds: string[];
  initialFavoriteGameId: string;
};

function getShortGameName(name: string) {
  if (name === "Magic: The Gathering") return "Magic";
  if (name === "One Piece Card Game") return "One Piece";
  if (name === "Disney Lorcana") return "Lorcana";

  return name;
}

export function TcgPreferencesForm({
  games,
  initialSelectedGameIds,
  initialFavoriteGameId,
}: TcgPreferencesFormProps) {
  const [selectedGameIds, setSelectedGameIds] = useState(initialSelectedGameIds);
  const [favoriteGameId, setFavoriteGameId] = useState(initialFavoriteGameId);

  function toggleGame(gameId: string) {
    setSelectedGameIds((current) => {
      const isSelected = current.includes(gameId);

      const nextSelected = isSelected
        ? current.filter((id) => id !== gameId)
        : [...current, gameId];

      if (nextSelected.length === 0) {
        setFavoriteGameId("");
        return nextSelected;
      }

      if (!nextSelected.includes(favoriteGameId)) {
        setFavoriteGameId(nextSelected[0]);
      }

      if (nextSelected.length === 1) {
        setFavoriteGameId(nextSelected[0]);
      }

      return nextSelected;
    });
  }

  return (
    <form action={updateUserTcgPreferencesAction} className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {games.map((game) => {
          const isSelected = selectedGameIds.includes(game.id);
          const isFavorite = favoriteGameId === game.id;

          return (
            <div
              key={game.id}
              className={`rounded-3xl border bg-white p-4 transition ${
                isSelected ? "border-slate-950 shadow-sm" : "opacity-70"
              }`}
            >
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="interestedGameIds"
                  value={game.id}
                  checked={isSelected}
                  onChange={() => toggleGame(game.id)}
                  className="mt-1"
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{getShortGameName(game.name)}</p>

                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">{game.slug}</p>
                </div>
              </label>

              <label
                className={`mt-4 flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-xs ${
                  isSelected
                    ? "bg-slate-50 text-slate-700"
                    : "bg-slate-50 text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="favoriteGameId"
                  value={game.id}
                  checked={isFavorite}
                  disabled={!isSelected}
                  onChange={() => setFavoriteGameId(game.id)}
                />

                <Star className="h-3.5 w-3.5" />
                Favourite / Standard
              </label>
            </div>
          );
        })}
      </div>

      {selectedGameIds.length === 0 && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Bitte wähle mindestens ein TCG aus.
        </div>
      )}

      <div className="flex flex-col justify-between gap-3 rounded-3xl bg-slate-50 p-5 md:flex-row md:items-center">
        <div>
          <p className="font-medium">Preference speichern</p>
          <p className="mt-1 text-sm text-slate-500">
            Dein Favourite-TCG wird beim Login automatisch geöffnet. Die Hubseite
            zeigt danach nur deine ausgewählten TCGs.
          </p>
        </div>

        <Button
          type="submit"
          disabled={selectedGameIds.length === 0 || !favoriteGameId}
        >
          Speichern
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="rounded-full">
          Ausgewählt: {selectedGameIds.length}
        </Badge>

        <Badge variant="outline" className="rounded-full">
          Favourite gesetzt: {favoriteGameId ? "Ja" : "Nein"}
        </Badge>
      </div>
    </form>
  );
}