import { SiteHeader } from "@/components/layout/site-header";
import { MarketplaceOverview } from "@/components/marketplace/marketplace-overview";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

function getGameName(listing: {
  listingType: string;
  items: {
    cardVariant: {
      card: {
        game: {
          name: string;
        };
      };
    };
  }[];
}) {
  const firstGame = listing.items[0]?.cardVariant.card.game.name;

  if (firstGame) return firstGame;

  if (listing.listingType === "BINDER") return "Mixed TCG";

  return "Unknown";
}

export default async function MarketplacePage() {
  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      seller: true,
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
      game: getGameName(listing),
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
      <MarketplaceOverview listings={marketplaceListings} />
    </main>
  );
}