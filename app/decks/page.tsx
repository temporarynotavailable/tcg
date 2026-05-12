import { DeckBuilderOverview } from "@/components/decks/deck-builder-overview";
import { SiteHeader } from "@/components/layout/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDeckType(metadata: string | null) {
  if (!metadata) return "Card";

  try {
    const parsed = JSON.parse(metadata);
    return parsed.deckType ?? "Card";
  } catch {
    return "Card";
  }
}

export default async function DecksPage() {
  const deck = await prisma.deck.findFirst({
    where: {
      name: "Miraidon League Deck",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      game: true,
      cards: {
        include: {
          cardVariant: {
            include: {
              collectionItems: true,
              priceSnapshots: {
                orderBy: {
                  date: "desc",
                },
                take: 1,
              },
              card: {
                include: {
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
      },
    },
  });

  const deckCards =
    deck?.cards.map((deckCard) => {
      const variant = deckCard.cardVariant;
      const card = variant.card;
      const latestPrice = variant.priceSnapshots[0];
      const latestRating = card.playRatings[0];

      const owned = variant.collectionItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      return {
        id: deckCard.id,
        name: card.name,
        imageUrl: card.imageUrl,
        game: deck.game.name,
        type: formatDeckType(card.metadata),
        quantity: deckCard.quantity,
        owned,
        price: latestPrice?.normalizedPrice ?? 0,
        playRating: latestRating?.rating ?? 0,
        role: deckCard.role ?? "Deck card",
      };
    }) ?? [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <DeckBuilderOverview
        deck={{
          name: deck?.name ?? "Kein Deck gefunden",
          game: deck?.game.name ?? "Unknown",
          format: deck?.format ?? "Unknown",
          playRating: deck?.playRating ?? 0,
        }}
        cards={deckCards}
      />
    </main>
  );
}