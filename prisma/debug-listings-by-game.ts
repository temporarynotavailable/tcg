import { prisma } from "../lib/prisma";

async function main() {
  console.log("🔎 Debug listings by game...\n");

  const games = await prisma.game.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      listings: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          seller: true,
        },
      },
    },
  });

  for (const game of games) {
    console.log(`🎮 ${game.name}`);
    console.log(`Slug: ${game.slug}`);
    console.log(`ID: ${game.id}`);

    const byStatus = game.listings.reduce<Record<string, number>>(
      (acc, listing) => {
        acc[listing.status] = (acc[listing.status] ?? 0) + 1;
        return acc;
      },
      {},
    );

    console.log("Listings by status:", byStatus);

    const activeListings = game.listings.filter(
      (listing) => listing.status === "ACTIVE",
    );

    if (activeListings.length > 0) {
      console.log("ACTIVE listings:");

      for (const listing of activeListings) {
        console.log(
          `- ${listing.title} · ${listing.price} ${listing.currency} · seller ${
            listing.seller.username
          } · id ${listing.id}`,
        );
      }
    } else {
      console.log("ACTIVE listings: 0");
    }

    console.log("");
  }

  const listingsWithoutGame = await prisma.listing.findMany({
    where: {
      gameId: null,
    },
  });

  console.log(`⚠️ Listings without gameId: ${listingsWithoutGame.length}`);

  if (listingsWithoutGame.length > 0) {
    for (const listing of listingsWithoutGame) {
      console.log(`- ${listing.title} · ${listing.status} · ${listing.id}`);
    }
  }

  console.log("\n✅ Debug complete");
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