import { prisma } from "../lib/prisma";

type DemoDeckCard = {
  name: string;
  number: string;
  rarity: string;
  language: string;
  finish: string;
  condition: string;
  deckType: string;
  quantity: number;
  owned: number;
  price: number;
  playRating: number;
  role: string;
};

const demoDeckCards: DemoDeckCard[] = [
  {
    name: "Miraidon ex",
    number: "081/198",
    rarity: "Double Rare",
    language: "EN",
    finish: "Holo",
    condition: "NEAR_MINT",
    deckType: "Pokémon",
    quantity: 3,
    owned: 3,
    price: 8.9,
    playRating: 9.0,
    role: "Main attacker",
  },
  {
    name: "Iron Hands ex",
    number: "070/182",
    rarity: "Double Rare",
    language: "EN",
    finish: "Holo",
    condition: "NEAR_MINT",
    deckType: "Pokémon",
    quantity: 2,
    owned: 1,
    price: 13.5,
    playRating: 8.8,
    role: "Prize pressure",
  },
  {
    name: "Professor's Research",
    number: "087/091",
    rarity: "Uncommon",
    language: "DE",
    finish: "Normal",
    condition: "NEAR_MINT",
    deckType: "Trainer",
    quantity: 4,
    owned: 4,
    price: 0.4,
    playRating: 8.3,
    role: "Draw engine",
  },
  {
    name: "Boss's Orders",
    number: "172/193",
    rarity: "Rare",
    language: "DE",
    finish: "Normal",
    condition: "EXCELLENT",
    deckType: "Trainer",
    quantity: 3,
    owned: 2,
    price: 1.8,
    playRating: 8.6,
    role: "Target control",
  },
  {
    name: "Electric Generator",
    number: "170/198",
    rarity: "Uncommon",
    language: "EN",
    finish: "Normal",
    condition: "NEAR_MINT",
    deckType: "Trainer",
    quantity: 4,
    owned: 4,
    price: 0.9,
    playRating: 8.9,
    role: "Energy acceleration",
  },
  {
    name: "Lightning Energy",
    number: "257/198",
    rarity: "Common",
    language: "EN",
    finish: "Normal",
    condition: "NEAR_MINT",
    deckType: "Energy",
    quantity: 14,
    owned: 14,
    price: 0.1,
    playRating: 7.0,
    role: "Energy base",
  },
];

async function main() {
  console.log("⚡ Adding Miraidon deck demo data...");

  const user = await prisma.user.findFirst({
    where: {
      username: "CardVault",
    },
  });

  if (!user) {
    throw new Error("Demo user CardVault not found. Run prisma/seed.ts first.");
  }

  const pokemon = await prisma.game.findFirst({
    where: {
      slug: "POKEMON",
    },
  });

  if (!pokemon) {
    throw new Error("Pokémon game not found. Run prisma/seed.ts first.");
  }

  let set = await prisma.cardSet.findFirst({
    where: {
      gameId: pokemon.id,
      name: "Miraidon Demo Deck",
    },
  });

  if (!set) {
    set = await prisma.cardSet.create({
      data: {
        gameId: pokemon.id,
        name: "Miraidon Demo Deck",
        code: "MDD",
      },
    });
  }

  let priceSource = await prisma.priceSource.findFirst({
    where: {
      name: "TCG Nexus Deck Demo",
    },
  });

  if (!priceSource) {
    priceSource = await prisma.priceSource.create({
      data: {
        name: "TCG Nexus Deck Demo",
        region: "EU",
        currency: "EUR",
        reliabilityScore: 0.9,
      },
    });
  }

  const existingDeck = await prisma.deck.findFirst({
    where: {
      userId: user.id,
      name: "Miraidon League Deck",
    },
  });

  if (existingDeck) {
    await prisma.deckCard.deleteMany({
      where: {
        deckId: existingDeck.id,
      },
    });

    await prisma.deck.delete({
      where: {
        id: existingDeck.id,
      },
    });
  }

  const preparedCards = [];

  for (const demoCard of demoDeckCards) {
    let card = await prisma.card.findFirst({
      where: {
        gameId: pokemon.id,
        name: demoCard.name,
        cardNumber: demoCard.number,
      },
    });

    if (!card) {
      card = await prisma.card.create({
        data: {
          gameId: pokemon.id,
          setId: set.id,
          name: demoCard.name,
          cardNumber: demoCard.number,
          rarity: demoCard.rarity,
          metadata: JSON.stringify({
            deckType: demoCard.deckType,
            trend: demoCard.playRating >= 8.5 ? "+ Meta" : "Stable",
            seedValue: demoCard.price,
          }),
        },
      });
    }

    let variant = await prisma.cardVariant.findFirst({
      where: {
        cardId: card.id,
        language: demoCard.language,
        finish: demoCard.finish,
      },
    });

    if (!variant) {
      variant = await prisma.cardVariant.create({
        data: {
          cardId: card.id,
          language: demoCard.language,
          finish: demoCard.finish,
          edition: "Standard",
          productType: "CARD",
        },
      });
    }

    const existingCollectionItem = await prisma.collectionItem.findFirst({
      where: {
        userId: user.id,
        cardVariantId: variant.id,
      },
    });

    if (existingCollectionItem) {
      await prisma.collectionItem.update({
        where: {
          id: existingCollectionItem.id,
        },
        data: {
          quantity: demoCard.owned,
          condition: demoCard.condition,
          acquiredPrice: demoCard.price,
        },
      });
    } else {
      await prisma.collectionItem.create({
        data: {
          userId: user.id,
          cardVariantId: variant.id,
          quantity: demoCard.owned,
          condition: demoCard.condition,
          acquiredPrice: demoCard.price,
        },
      });
    }

    await prisma.cardPlayRating.deleteMany({
      where: {
        cardId: card.id,
        format: "Standard",
      },
    });

    await prisma.cardPlayRating.create({
      data: {
        cardId: card.id,
        gameId: pokemon.id,
        format: "Standard",
        rating: demoCard.playRating,
        usagePercent: demoCard.playRating * 7,
        trend: demoCard.playRating >= 8.5 ? "Meta relevant" : "Playable",
      },
    });

    await prisma.priceSnapshot.deleteMany({
      where: {
        cardVariantId: variant.id,
        sourceId: priceSource.id,
      },
    });

    await prisma.priceSnapshot.create({
      data: {
        cardVariantId: variant.id,
        sourceId: priceSource.id,
        rawPrice: demoCard.price,
        normalizedPrice: demoCard.price,
        currency: "EUR",
        condition: demoCard.condition,
        confidence: 0.9,
      },
    });

    preparedCards.push({
      variant,
      quantity: demoCard.quantity,
      role: demoCard.role,
    });
  }

  const deck = await prisma.deck.create({
    data: {
      userId: user.id,
      gameId: pokemon.id,
      name: "Miraidon League Deck",
      format: "Standard",
      visibility: "PRIVATE",
      playRating: 8.6,
      isForSale: false,
      cards: {
        create: preparedCards.map((card) => ({
          cardVariantId: card.variant.id,
          quantity: card.quantity,
          role: card.role,
        })),
      },
    },
  });

  console.log("✅ Deck demo seed complete");
  console.log({ deck: deck.name, cards: preparedCards.length });
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