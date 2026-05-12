import { AddCardForm } from "@/components/collection/add-card-form";
import { SiteHeader } from "@/components/layout/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AddCollectionCardPage() {
  const cardVariants = await prisma.cardVariant.findMany({
    where: {
      card: {
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
    game: variant.card.game.name,
    label: `${variant.card.name} · ${variant.card.game.name} · ${
      variant.card.set?.name ?? "Unknown Set"
    } · ${variant.language}${variant.finish ? ` · ${variant.finish}` : ""}`,
  }));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />
      <AddCardForm cardOptions={cardOptions} />
    </main>
  );
}