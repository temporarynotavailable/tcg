import { GameAreaSwitcher } from "@/components/games/game-area-switcher";
import { SiteHeader } from "@/components/layout/site-header";
import { MarketplaceOverview } from "@/components/marketplace/marketplace-overview";
import {
  getGameByRouteSlug,
  getGamesForNavigation,
} from "@/lib/game-routing";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type GameMarketplacePageProps = {
  params: Promise<{
    gameSlug: string;
  }>;
};

function formatListingType(type: string) {
  const map: Record<string, string> = {
    SINGLE_CARD: "Einzelkarte",
    SEALED_PRODUCT: "Sealed",
    DECK: "Deck",
    BINDER: "Binder",
    COLLECTION: "Sammlung",
  };

  return map[type] ?? type;
}

function getTrustLabel(role: string, kycStatus: string) {
  if (role === "TRUSTED_MEMBER") return "Trusted Member";
  if (kycStatus === "VERIFIED") return "Verified";
  return "Basic";
}

function getSellerRating(reputationScore: number) {
  const rating = Math.min(5, Math.max(3.5, reputationScore / 20));
  return rating.toFixed(1);
}

function getTrendFromMetadata(metadata: string | null) {
  if (!metadata) return "—";

  try {
    const parsed = JSON.parse(metadata);
    return parsed.trend ?? "—";
  } catch {
    return "—";
  }
}

function getListingMeta(listing: {
  listingType: string;
  binderSale: {
    detectedCardCount: number;
    confirmedCardCount: number;
  } | null;
  items: {
    cardVariant: {
      card: {
        playRatings: {
          rating: number;
        }[];
      };
    };
  }[];
}) {
  if (listing.listingType === "BINDER" && listing.binderSale) {
    return `AI erkannt: ${listing.binderSale.confirmedCardCount}/${listing.binderSale.detectedCardCount}`;
  }

  const rating = listing.items[0]?.cardVariant.card.playRatings[0]?.rating;

  if (rating) {
    return `Play Rating ${rating.toFixed(1)}`;
  }

  return "Marketplace Listing";
}

export default async function GameMarketplacePage({
  params,
}: GameMarketplacePageProps) {
  const { gameSlug } = await params;

  const selectedGame = await getGameByRouteSlug(gameSlug);
  const games = await getGamesForNavigation();

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      gameId: selectedGame.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      seller: true,
      game: true,
      binderSale: true,
      items: {
        include: {
          cardVariant: {
            include: {
              card: {
                include: {
                  game: true,
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

  const marketplaceListings = listings.map((listing) => {
    const firstCard = listing.items[0]?.cardVariant.card;

    return {
      id: listing.id,
      title: listing.title,
      imageUrl: firstCard?.imageUrl ?? null,
      game: selectedGame.name,
      type: formatListingType(listing.listingType),
      seller: listing.seller.displayName ?? listing.seller.username,
      trust: getTrustLabel(listing.seller.role, listing.seller.kycStatus),
      rating: getSellerRating(listing.seller.reputationScore),
      price: listing.price,
      marketTrend: getTrendFromMetadata(firstCard?.metadata ?? null),
      meta: getListingMeta(listing),
      description: listing.description ?? "Keine Beschreibung vorhanden.",
      verified: listing.seller.kycStatus === "VERIFIED",
    };
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pt-8">
        <GameAreaSwitcher
          games={games}
          selectedGame={selectedGame}
          sectionPath="/marketplace"
        />
      </section>

      <MarketplaceOverview
        listings={marketplaceListings}
        basePath={`/${selectedGame.slug}/marketplace`}
      />
    </main>
  );
}