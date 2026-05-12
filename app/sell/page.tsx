import { GameSwitcher } from "@/components/games/game-switcher";
import { SiteHeader } from "@/components/layout/site-header";
import { SellOverview } from "@/components/sell/sell-overview";
import { getAvailableGames, getSelectedGame } from "@/lib/game-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SellPageProps = {
  searchParams?: Promise<{
    game?: string;
  }>;
};

export default async function SellPage({ searchParams }: SellPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedGame = await getSelectedGame(resolvedSearchParams);
  const games = await getAvailableGames();

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
        <GameSwitcher
          games={games}
          selectedGame={selectedGame}
          pathname="/sell"
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