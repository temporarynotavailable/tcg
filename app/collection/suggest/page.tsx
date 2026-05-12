import { SuggestCardForm } from "@/components/collection/suggest-card-form";
import { SiteHeader } from "@/components/layout/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuggestCardPage() {
  const games = await prisma.game.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />
      <SuggestCardForm
        games={games.map((game) => ({
          id: game.id,
          name: game.name,
        }))}
      />
    </main>
  );
}