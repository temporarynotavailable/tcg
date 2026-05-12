import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const DEFAULT_GAME_ROUTE_SLUG = "pokemon";

export type GameRouteParams = {
  gameSlug: string;
};

export async function getGameByRouteSlug(gameSlug: string) {
  const game = await prisma.game.findFirst({
    where: {
      slug: gameSlug,
      isActive: true,
    },
  });

  if (!game) {
    notFound();
  }

  return game;
}

export async function getGamesForNavigation() {
  return prisma.game.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export function createGameRoute(gameSlug: string, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `/${gameSlug}${normalizedPath}`;
}

export function getDefaultGameRoute(path: string) {
  return createGameRoute(DEFAULT_GAME_ROUTE_SLUG, path);
}