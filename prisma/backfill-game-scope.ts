import { prisma } from "../lib/prisma";

async function main() {
  console.log("🎯 Backfilling game scope...");

  const collectionItems = await prisma.collectionItem.findMany({
    include: {
      cardVariant: {
        include: {
          card: true,
        },
      },
    },
  });

  for (const item of collectionItems) {
    await prisma.collectionItem.update({
      where: {
        id: item.id,
      },
      data: {
        gameId: item.cardVariant.card.gameId,
      },
    });
  }

  console.log(`✅ CollectionItems updated: ${collectionItems.length}`);

  const listings = await prisma.listing.findMany({
    include: {
      items: {
        include: {
          cardVariant: {
            include: {
              card: true,
            },
          },
        },
      },
      binderSale: true,
    },
  });

  for (const listing of listings) {
    const firstGameId = listing.items[0]?.cardVariant.card.gameId;

    if (firstGameId) {
      await prisma.listing.update({
        where: {
          id: listing.id,
        },
        data: {
          gameId: firstGameId,
        },
      });

      continue;
    }

    if (listing.listingType === "BINDER" || listing.listingType === "COLLECTION") {
      const onePiece = await prisma.game.findFirst({
        where: {
          slug: "ONE_PIECE",
        },
      });

      await prisma.listing.update({
        where: {
          id: listing.id,
        },
        data: {
          gameId: onePiece?.id ?? null,
        },
      });
    }
  }

  console.log(`✅ Listings checked: ${listings.length}`);

  const orders = await prisma.tradeOrder.findMany({
    include: {
      listing: true,
    },
  });

  for (const order of orders) {
    await prisma.tradeOrder.update({
      where: {
        id: order.id,
      },
      data: {
        gameId: order.listing.gameId,
      },
    });
  }

  console.log(`✅ Orders updated: ${orders.length}`);

  console.log("✅ Game scope backfill complete");
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