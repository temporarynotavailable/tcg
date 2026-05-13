import { SuggestCardForm } from "@/components/collection/suggest-card-form";
import { GameAreaSwitcher } from "@/components/games/game-area-switcher";
import { SiteHeader } from "@/components/layout/site-header";
import {
  getGameByRouteSlug,
  getGamesForNavigation,
} from "@/lib/game-routing";

export const dynamic = "force-dynamic";

type GameCollectionSuggestPageProps = {
  params: Promise<{
    gameSlug: string;
  }>;
};

export default async function GameCollectionSuggestPage({
  params,
}: GameCollectionSuggestPageProps) {
  const { gameSlug } = await params;

  const selectedGame = await getGameByRouteSlug(gameSlug);
  const games = await getGamesForNavigation();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pt-8">
        <GameAreaSwitcher
          games={games}
          selectedGame={selectedGame}
          sectionPath="/collection/suggest"
        />
      </section>

      <SuggestCardForm
        selectedGame={{
          id: selectedGame.id,
          name: selectedGame.name,
          slug: selectedGame.slug,
        }}
        basePath={`/${selectedGame.slug}/collection`}
      />
    </main>
  );
}