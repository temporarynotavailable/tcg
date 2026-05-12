import { prisma } from "../lib/prisma";

async function main() {
  console.log("🧭 Repairing order game scope...");

  const orders = await prisma.tradeOrder.findMany({
    include: {
      listing: {
        include: {
          game: true,
          items: {
            include: {
              cardVariant: {
                include: {
                  card: {
                    include: {
                      game: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      items: {
        include: {
          cardVariant: {
            include: {
              card: {
                include: {
                  game: true,
                },
              },
            },
          },
        },
      },
    },
  });

  let updatedOrders = 0;
  let updatedListings = 0;

  for (const order of orders) {
    const gameFromOrderItem = order.items[0]?.cardVariant?.card.game;
    const gameFromListingItem = order.listing.items[0]?.cardVariant.card.game;
    const gameFromListing = order.listing.game;

    const effectiveGame =
      gameFromOrderItem ?? gameFromListingItem ?? gameFromListing ?? null;

    if (!effectiveGame) {
      console.warn(
        `⚠️ Kein Game für Order gefunden: ${order.id} · Listing: ${order.listing.title}`,
      );
      continue;
    }

    if (order.gameId !== effectiveGame.id) {
      await prisma.tradeOrder.update({
        where: {
          id: order.id,
        },
        data: {
          gameId: effectiveGame.id,
        },
      });

      updatedOrders++;
    }

    if (order.listing.gameId !== effectiveGame.id) {
      await prisma.listing.update({
        where: {
          id: order.listing.id,
        },
        data: {
          gameId: effectiveGame.id,
        },
      });

      updatedListings++;
    }

    console.log(
      `✅ ${order.listing.title} → ${effectiveGame.name} (${effectiveGame.slug})`,
    );
  }

  console.log(`✅ Orders repaired: ${updatedOrders}`);
  console.log(`✅ Listings repaired: ${updatedListings}`);
  console.log("✅ Order game scope repair complete");
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