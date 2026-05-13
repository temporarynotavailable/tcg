import { CollectionOverview } from "@/components/collection/collection-overview";
import { GameAreaSwitcher } from "@/components/games/game-area-switcher";
import { SiteHeader } from "@/components/layout/site-header";
import {
  getGameByRouteSlug,
  getGamesForNavigation,
} from "@/lib/game-routing";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type GameCollectionPageProps = {
  params: Promise<{
    gameSlug: string;
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

export default async function GameCollectionPage({
  params,
}: GameCollectionPageProps) {
  const { gameSlug } = await params;

  const selectedGame = await getGameByRouteSlug(gameSlug);
  const games = await getGamesForNavigation();

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
      game: selectedGame.name,
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
        <GameAreaSwitcher
          games={games}
          selectedGame={selectedGame}
          sectionPath="/collection"
        />
      </section>

      <CollectionOverview
        cards={cards}
        basePath={`/${selectedGame.slug}/collection`}
      />
    </main>
  );
}