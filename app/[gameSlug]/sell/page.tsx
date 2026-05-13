import { GameAreaSwitcher } from "@/components/games/game-area-switcher";
import { SiteHeader } from "@/components/layout/site-header";
import { SellOverview } from "@/components/sell/sell-overview";
import {
  getGameByRouteSlug,
  getGamesForNavigation,
} from "@/lib/game-routing";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type GameSellPageProps = {
  params: Promise<{
    gameSlug: string;
  }>;
};

export default async function GameSellPage({ params }: GameSellPageProps) {
  const { gameSlug } = await params;

  const selectedGame = await getGameByRouteSlug(gameSlug);
  const games = await getGamesForNavigation();

  const cardVariants = await prisma.cardVariant.findMany({
    where: {
      card: {
        gameId: selectedGame.id,
        moderationStatus: "APPROVED",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      card: {
        include: {
          game: true,
          set: true,
        },
      },
    },
  });

  const cardOptions = cardVariants.map((variant) => ({
    id: variant.id,
    gameId: variant.card.gameId,
    label: `${variant.card.name} · ${variant.card.game.name} · ${
      variant.card.set?.name ?? "Unknown Set"
    } · ${variant.language}${variant.finish ? ` · ${variant.finish}` : ""}`,
  }));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pt-8">
        <GameAreaSwitcher
          games={games}
          selectedGame={selectedGame}
          sectionPath="/sell"
        />
      </section>

      <SellOverview
        cardOptions={cardOptions}
        selectedGame={{
          id: selectedGame.id,
          name: selectedGame.name,
          slug: selectedGame.slug,
        }}
      />
    </main>
  );
}