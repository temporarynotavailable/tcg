import Link from "next/link";
import { Gamepad2 } from "lucide-react";

import { createGameRoute } from "@/lib/game-routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type GameAreaSwitcherProps = {
  games: {
    id: string;
    name: string;
    slug: string;
  }[];
  selectedGame: {
    id: string;
    name: string;
    slug: string;
  };
  sectionPath: string;
};

function getShortGameName(name: string) {
  if (name === "Magic: The Gathering") return "Magic";
  if (name === "One Piece Card Game") return "One Piece";
  if (name === "Disney Lorcana") return "Lorcana";

  return name;
}

export function GameAreaSwitcher({
  games,
  selectedGame,
  sectionPath,
}: GameAreaSwitcherProps) {
  return (
    <div className="rounded-3xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Gamepad2 className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-medium">Aktiver TCG-Bereich</p>
            <p className="text-xs text-slate-500">
              Du bewegst dich in einem getrennten Spielbereich.
            </p>
          </div>
        </div>

        <Badge className="rounded-full px-3 py-1">
          {selectedGame.name}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {games.map((game) => {
          const isActive = game.id === selectedGame.id;

          return (
            <Button
              key={game.id}
              size="sm"
              variant={isActive ? "default" : "outline"}
              className="rounded-full"
              asChild
            >
              <Link href={createGameRoute(game.slug, sectionPath)}>
                {getShortGameName(game.name)}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}