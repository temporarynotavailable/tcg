import { prisma } from "@/lib/prisma";

export const DEFAULT_GAME_SLUG = "POKEMON";

type SearchParamsInput = {
  game?: string | string[];
};

export async function getAvailableGames() {
  return prisma.game.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getSelectedGame(searchParams?: SearchParamsInput) {
  const gameParam = searchParams?.game;
  const requestedSlug = Array.isArray(gameParam)
    ? gameParam[0]
    : gameParam ?? DEFAULT_GAME_SLUG;

  const selectedGame =
    (await prisma.game.findFirst({
      where: {
        slug: requestedSlug,
        isActive: true,
      },
    })) ??
    (await prisma.game.findFirst({
      where: {
        slug: DEFAULT_GAME_SLUG,
        isActive: true,
      },
    })) ??
    (await prisma.game.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    }));

  if (!selectedGame) {
    throw new Error("Kein aktives TCG gefunden.");
  }

  return selectedGame;
}

export function createGameHref(pathname: string, gameSlug: string) {
  return `${pathname}?game=${gameSlug}`;
}