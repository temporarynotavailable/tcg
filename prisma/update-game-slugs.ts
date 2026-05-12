import { prisma } from "../lib/prisma";

const gameSlugUpdates = [
  {
    name: "Pokémon",
    oldSlugs: ["POKEMON", "pokemon"],
    newSlug: "pokemon",
  },
  {
    name: "One Piece Card Game",
    oldSlugs: ["ONE_PIECE", "one-piece"],
    newSlug: "one-piece",
  },
  {
    name: "Magic: The Gathering",
    oldSlugs: ["MAGIC", "magic"],
    newSlug: "magic",
  },
  {
    name: "Disney Lorcana",
    oldSlugs: ["LORCANA", "lorcana"],
    newSlug: "lorcana",
  },
  {
    name: "Yu-Gi-Oh!",
    oldSlugs: ["YUGIOH", "yugioh", "yu-gi-oh"],
    newSlug: "yu-gi-oh",
  },
];

async function main() {
  console.log("🎮 Updating game slugs...");

  for (const update of gameSlugUpdates) {
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          {
            name: update.name,
          },
          {
            slug: {
              in: update.oldSlugs,
            },
          },
        ],
      },
    });

    if (!game) {
      console.warn(`⚠️ Game not found: ${update.name}`);
      continue;
    }

    await prisma.game.update({
      where: {
        id: game.id,
      },
      data: {
        slug: update.newSlug,
      },
    });

    console.log(`✅ ${game.name}: ${game.slug} → ${update.newSlug}`);
  }

  const games = await prisma.game.findMany({
    orderBy: {
      name: "asc",
    },
  });

  console.log("\n📦 Current games:");

  for (const game of games) {
    console.log(`- ${game.name}: ${game.slug}`);
  }

  console.log("\n✅ Game slug update complete");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });