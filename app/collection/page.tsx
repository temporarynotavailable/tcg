import { CollectionOverview } from "@/components/collection/collection-overview";
import { GameSwitcher } from "@/components/games/game-switcher";
import { SiteHeader } from "@/components/layout/site-header";
import { getAvailableGames, getSelectedGame } from "@/lib/game-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CollectionPageProps = {
  searchParams?: Promise<{
    game?: string;
  }>;
};

function getTrendFromMetadata(metadata: string | null) {
  if (!metadata) return "—";

  try {
    const parsed = JSON.parse(metadata);
    return parsed.trend ?? "—";
  } catch {
    return "—";
  }
}

function getCardStatus(playRating: number) {
  if (playRating >= 8.5) return "Meta relevant";
  if (playRating >= 7.5) return "Playable";
  if (playRating >= 6) return "Casual";
  return "Collector card";
}

export default async function CollectionPage({
  searchParams,
}: CollectionPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedGame = await getSelectedGame(resolvedSearchParams);
  const games = await getAvailableGames();

  const collectionItems = await prisma.collectionItem.findMany({
    where: {
      gameId: selectedGame.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      cardVariant: {
        include: {
          priceSnapshots: {
            orderBy: {
              date: "desc",
            },
            take: 1,
          },
          card: {
            include: {
              game: true,
              set: true,
              playRatings: {
                orderBy: {
                  lastUpdated: "desc",
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  const cards = collectionItems.map((item) => {
    const variant = item.cardVariant;
    const card = variant.card;
    const latestPrice = variant.priceSnapshots[0];
    const latestPlayRating = card.playRatings[0];

    const value = latestPrice?.normalizedPrice ?? item.acquiredPrice ?? 0;
    const playRating = latestPlayRating?.rating ?? 0;

    return {
      id: item.id,
      name: card.name,
      imageUrl: card.imageUrl,
      game: card.game.name,
      set: card.set?.name ?? "Unknown Set",
      number: card.cardNumber ?? "—",
      condition: item.condition,
      language: variant.language,
      quantity: item.quantity,
      value,
      trend: getTrendFromMetadata(card.metadata),
      playRating: playRating.toFixed(1),
      status: getCardStatus(playRating),
    };
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pt-8">
        <GameSwitcher
          games={games}
          selectedGame={selectedGame}
          pathname="/collection"
        />
      </section>

      <CollectionOverview cards={cards} />
    </main>
  );
}