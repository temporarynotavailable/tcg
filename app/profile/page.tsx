import { SiteHeader } from "@/components/layout/site-header";
import { TrustCenter } from "@/components/profile/trust-center";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await prisma.user.findFirst({
    where: {
      username: "CardVault",
    },
  });

  if (!user) {
    throw new Error("Demo-User CardVault wurde nicht gefunden.");
  }

  const [collectionItems, activeListings, soldListings, decks] =
    await Promise.all([
      prisma.collectionItem.count({
        where: {
          userId: user.id,
        },
      }),
      prisma.listing.count({
        where: {
          sellerId: user.id,
          status: "ACTIVE",
        },
      }),
      prisma.listing.count({
        where: {
          sellerId: user.id,
          status: "SOLD",
        },
      }),
      prisma.deck.count({
        where: {
          userId: user.id,
        },
      }),
    ]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <TrustCenter
        user={{
          username: user.username,
          displayName: user.displayName ?? user.username,
          email: user.email,
          role: user.role,
          kycStatus: user.kycStatus,
          reputationScore: user.reputationScore,
          trustLevel: user.trustLevel,
          createdAt: user.createdAt.toISOString(),
        }}
        stats={{
          collectionItems,
          activeListings,
          soldListings,
          decks,
        }}
      />
    </main>
  );
}