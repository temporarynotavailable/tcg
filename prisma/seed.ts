import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.priceSnapshot.deleteMany();
  await prisma.priceSource.deleteMany();
  await prisma.deckCard.deleteMany();
  await prisma.deck.deleteMany();
  await prisma.listingItem.deleteMany();
  await prisma.binderSale.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.collectionItem.deleteMany();
  await prisma.cardPlayRating.deleteMany();
  await prisma.cardVariant.deleteMany();
  await prisma.card.deleteMany();
  await prisma.cardSet.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "demo@tcgnexus.local",
      username: "CardVault",
      displayName: "CardVault",
      role: "TRUSTED_MEMBER",
      kycStatus: "VERIFIED",
      reputationScore: 98,
      trustLevel: 4,
    },
  });

  const pokemon = await prisma.game.create({
    data: {
      name: "Pokémon",
      slug: "POKEMON",
      description: "Pokémon Trading Card Game",
    },
  });

  const onePiece = await prisma.game.create({
    data: {
      name: "One Piece Card Game",
      slug: "ONE_PIECE",
      description: "One Piece Trading Card Game",
    },
  });

  const magic = await prisma.game.create({
    data: {
      name: "Magic: The Gathering",
      slug: "MAGIC",
      description: "Magic: The Gathering",
    },
  });

  const lorcana = await prisma.game.create({
    data: {
      name: "Disney Lorcana",
      slug: "LORCANA",
      description: "Disney Lorcana Trading Card Game",
    },
  });

  const yugioh = await prisma.game.create({
    data: {
      name: "Yu-Gi-Oh!",
      slug: "YUGIOH",
      description: "Yu-Gi-Oh! Trading Card Game",
    },
  });

  const paldeanFates = await prisma.cardSet.create({
    data: {
      gameId: pokemon.id,
      name: "Paldean Fates",
      code: "PAF",
    },
  });

  const romanceDawn = await prisma.cardSet.create({
    data: {
      gameId: onePiece.id,
      name: "Romance Dawn",
      code: "OP01",
    },
  });

  const lotr = await prisma.cardSet.create({
    data: {
      gameId: magic.id,
      name: "The Lord of the Rings",
      code: "LTR",
    },
  });

  const floodborn = await prisma.cardSet.create({
    data: {
      gameId: lorcana.id,
      name: "Rise of the Floodborn",
      code: "ROTF",
    },
  });

  const lob = await prisma.cardSet.create({
    data: {
      gameId: yugioh.id,
      name: "Legend of Blue Eyes",
      code: "LOB",
    },
  });

  async function createCardWithVariant(input: {
    gameId: string;
    setId: string;
    name: string;
    cardNumber: string;
    rarity: string;
    language: string;
    finish: string;
    condition: string;
    quantity: number;
    value: number;
    playRating: number;
    trend: string;
  }) {
    const card = await prisma.card.create({
      data: {
        gameId: input.gameId,
        setId: input.setId,
        name: input.name,
        cardNumber: input.cardNumber,
        rarity: input.rarity,
        metadata: JSON.stringify({
          seedValue: input.value,
          trend: input.trend,
        }),
      },
    });

    const variant = await prisma.cardVariant.create({
      data: {
        cardId: card.id,
        language: input.language,
        finish: input.finish,
        edition: "Standard",
        productType: "CARD",
      },
    });

    await prisma.collectionItem.create({
      data: {
        userId: user.id,
        cardVariantId: variant.id,
        quantity: input.quantity,
        condition: input.condition,
        acquiredPrice: input.value,
      },
    });

    await prisma.cardPlayRating.create({
      data: {
        cardId: card.id,
        gameId: input.gameId,
        format: "Standard",
        rating: input.playRating,
        usagePercent: input.playRating * 7,
        trend: input.trend,
      },
    });

    return { card, variant };
  }

  const charizard = await createCardWithVariant({
    gameId: pokemon.id,
    setId: paldeanFates.id,
    name: "Charizard ex",
    cardNumber: "054/091",
    rarity: "Ultra Rare",
    language: "DE",
    finish: "Holo",
    condition: "NEAR_MINT",
    quantity: 1,
    value: 42.9,
    playRating: 8.7,
    trend: "+12.4%",
  });

  const luffy = await createCardWithVariant({
    gameId: onePiece.id,
    setId: romanceDawn.id,
    name: "Monkey.D.Luffy",
    cardNumber: "OP01-003",
    rarity: "Leader",
    language: "EN",
    finish: "Normal",
    condition: "EXCELLENT",
    quantity: 2,
    value: 18.4,
    playRating: 7.9,
    trend: "+6.8%",
  });

  const oneRing = await createCardWithVariant({
    gameId: magic.id,
    setId: lotr.id,
    name: "The One Ring",
    cardNumber: "246",
    rarity: "Mythic Rare",
    language: "EN",
    finish: "Foil",
    condition: "NEAR_MINT",
    quantity: 1,
    value: 69.9,
    playRating: 9.1,
    trend: "+3.2%",
  });

  const elsa = await createCardWithVariant({
    gameId: lorcana.id,
    setId: floodborn.id,
    name: "Elsa - Spirit of Winter",
    cardNumber: "042",
    rarity: "Legendary",
    language: "DE",
    finish: "Foil",
    condition: "NEAR_MINT",
    quantity: 1,
    value: 34.5,
    playRating: 8.2,
    trend: "-2.1%",
  });

  const blueEyes = await createCardWithVariant({
    gameId: yugioh.id,
    setId: lob.id,
    name: "Blue-Eyes White Dragon",
    cardNumber: "LOB-001",
    rarity: "Ultra Rare",
    language: "EN",
    finish: "Holo",
    condition: "EXCELLENT",
    quantity: 1,
    value: 120,
    playRating: 4.6,
    trend: "+9.5%",
  });

  const internalSales = await prisma.priceSource.create({
    data: {
      name: "TCG Nexus Sales",
      region: "EU",
      currency: "EUR",
      reliabilityScore: 1,
    },
  });

  const ebay = await prisma.priceSource.create({
    data: {
      name: "eBay Last Solds",
      region: "GLOBAL",
      currency: "EUR",
      reliabilityScore: 0.85,
    },
  });

  for (const item of [
    { variant: charizard.variant, value: 42.9 },
    { variant: luffy.variant, value: 18.4 },
    { variant: oneRing.variant, value: 69.9 },
    { variant: elsa.variant, value: 34.5 },
    { variant: blueEyes.variant, value: 120 },
  ]) {
    await prisma.priceSnapshot.create({
      data: {
        cardVariantId: item.variant.id,
        sourceId: internalSales.id,
        rawPrice: item.value,
        normalizedPrice: item.value,
        currency: "EUR",
        condition: "NEAR_MINT",
        confidence: 0.95,
      },
    });

    await prisma.priceSnapshot.create({
      data: {
        cardVariantId: item.variant.id,
        sourceId: ebay.id,
        rawPrice: item.value * 1.08,
        normalizedPrice: item.value * 1.08,
        currency: "EUR",
        condition: "NEAR_MINT",
        confidence: 0.8,
      },
    });
  }

  const listing = await prisma.listing.create({
    data: {
      sellerId: user.id,
      listingType: "SINGLE_CARD",
      title: "Charizard ex Near Mint",
      description: "Paldean Fates · 054/091 · Deutsch · Near Mint",
      price: 42.9,
      status: "ACTIVE",
      items: {
        create: {
          cardVariantId: charizard.variant.id,
          quantity: 1,
          condition: "NEAR_MINT",
          language: "DE",
        },
      },
    },
  });

  await prisma.listing.create({
    data: {
      sellerId: user.id,
      listingType: "BINDER",
      title: "One Piece Binder mit 216 Karten",
      description: "Binderseiten fotografiert · AI-Erkennung vorbereitet",
      price: 640,
      status: "ACTIVE",
      binderSale: {
        create: {
          estimatedValue: 720,
          detectedCardCount: 216,
          confirmedCardCount: 198,
          images: {
            create: [
              {
                imageUrl: "/demo/binder-page-1.jpg",
                pageNumber: 1,
              },
              {
                imageUrl: "/demo/binder-page-2.jpg",
                pageNumber: 2,
              },
            ],
          },
        },
      },
    },
  });

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
        create: [
          {
            cardVariantId: charizard.variant.id,
            quantity: 1,
            role: "Tech attacker",
          },
        ],
      },
    },
  });

  console.log("✅ Seed complete");
  console.log({ user: user.username, listing: listing.title, deck: deck.name });
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