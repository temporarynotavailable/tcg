import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { SiteHeader } from "@/components/layout/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type GameAreaLayoutProps = {
  children: ReactNode;
};

export default async function GameAreaLayout({
  children,
}: GameAreaLayoutProps) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("tcg_user_id")?.value;

  const games = await prisma.game.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const user = userId
    ? await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      })
    : null;

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <SiteHeader />

        <section className="mx-auto max-w-5xl px-6 py-12">
          <AuthRequiredCard
            title="Login erforderlich."
            description="Melde dich ein, um diesen TCG-Bereich zu nutzen. Neue Accounts werden ausschließlich über die Startseite erstellt."
            games={games.map((game) => ({
              id: game.id,
              name: game.name,
              slug: game.slug,
            }))}
          />
        </section>
      </main>
    );
  }

  return children;
}