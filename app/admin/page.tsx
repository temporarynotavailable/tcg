import { AdminTabs } from "@/components/admin/admin-tabs";
import { SiteHeader } from "@/components/layout/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getNotesFromMetadata(metadata: string | null) {
  if (!metadata) return "";

  try {
    const parsed = JSON.parse(metadata);
    return parsed.notes ?? "";
  } catch {
    return "";
  }
}

function getRiskReasons(riskReasons: string | null) {
  if (!riskReasons) return [];

  try {
    const parsed = JSON.parse(riskReasons);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const listings = await prisma.listing.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      seller: true,
      binderSale: true,
      items: true,
    },
  });

  const cards = await prisma.card.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      game: true,
      set: true,
      createdByUser: true,
      variants: true,
    },
  });

  const adminListings = listings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    description: listing.description ?? "Keine Beschreibung vorhanden.",
    listingType: listing.listingType,
    status: listing.status,
    price: listing.price,
    seller: listing.seller.displayName ?? listing.seller.username,
    sellerRole: listing.seller.role,
    kycStatus: listing.seller.kycStatus,
    reputationScore: listing.seller.reputationScore,
    itemCount: listing.items.length,
    binderInfo: listing.binderSale
      ? `Binder: ${listing.binderSale.confirmedCardCount}/${listing.binderSale.detectedCardCount} bestätigt`
      : null,
riskScore: listing.riskScore,
riskLevel: listing.riskLevel,
riskReasons: getRiskReasons(listing.riskReasons),
createdAt: listing.createdAt.toISOString(),
  }));

  const cardProposals = cards.map((card) => ({
    id: card.id,
    name: card.name,
    game: card.game.name,
    set: card.set?.name ?? "Unknown Set",
    cardNumber: card.cardNumber ?? "",
    rarity: card.rarity ?? "",
    moderationStatus: card.moderationStatus,
    createdBy: card.createdByUser?.username ?? "System",
    variants:
      card.variants.length > 0
        ? card.variants
            .map((variant) =>
              `${variant.language}${variant.finish ? ` · ${variant.finish}` : ""}`,
            )
            .join(", ")
        : "Keine Variante",
    notes: getNotesFromMetadata(card.metadata),
  }));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />
      <AdminTabs listings={adminListings} cards={cardProposals} />
    </main>
  );
}