import { prisma } from "../lib/prisma";

function findFirstImageUrl(value: unknown): string | null {
  if (typeof value === "string") {
    const looksLikeImage =
      value.includes(".png") ||
      value.includes(".jpg") ||
      value.includes(".jpeg") ||
      value.includes(".webp") ||
      value.includes(".avif");

    return looksLikeImage ? value : null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findFirstImageUrl(item);
      if (result) return result;
    }
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const result = findFirstImageUrl(item);
      if (result) return result;
    }
  }

  return null;
}

async function fetchJson(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${url} (${response.status})`);
  }

  return response.json();
}

async function fetchScryfallImage(cardName: string) {
  const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`;
  const data = await fetchJson(url);

  return (
    data.image_uris?.normal ??
    data.image_uris?.large ??
    data.card_faces?.[0]?.image_uris?.normal ??
    null
  );
}

async function fetchYgoImage(cardName: string) {
  const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(cardName)}`;
  const data = await fetchJson(url);

  return data.data?.[0]?.card_images?.[0]?.image_url ?? null;
}

async function fetchLorcastImage(set: string, number: string) {
  const url = `https://api.lorcast.com/v0/cards/${set}/${number}`;
  const data = await fetchJson(url);

  return (
    data.image_uris?.digital?.normal ??
    data.image_uris?.digital?.large ??
    data.image_uris?.digital?.small ??
    null
  );
}

async function fetchOptcgImage(cardId: string) {
  const url = `https://optcgapi.com/api/sets/card/${cardId}/`;
  const data = await fetchJson(url);

  return findFirstImageUrl(data);
}

async function updateCardImage(cardName: string, imageUrl: string | null) {
  if (!imageUrl) {
    console.warn(`⚠️ No image found for ${cardName}`);
    return;
  }

  const updated = await prisma.card.updateMany({
    where: {
      name: cardName,
    },
    data: {
      imageUrl,
    },
  });

  console.log(`✅ ${cardName}: updated ${updated.count} card(s)`);
}

async function main() {
  console.log("🖼️ Adding real card images...");

  await updateCardImage(
    "Charizard ex",
    "https://images.pokemontcg.io/sv4pt5/54_hires.png",
  );

  await updateCardImage(
    "The One Ring",
    await fetchScryfallImage("The One Ring"),
  );

  await updateCardImage(
    "Blue-Eyes White Dragon",
    await fetchYgoImage("Blue-Eyes White Dragon"),
  );

  await updateCardImage(
    "Elsa - Spirit of Winter",
    await fetchLorcastImage("1", "42"),
  );

  try {
    await updateCardImage(
      "Monkey.D.Luffy",
      await fetchOptcgImage("OP01-003"),
    );
  } catch (error) {
    console.warn("⚠️ One Piece image fetch skipped:", error);
  }

  console.log("✅ Image seed complete");
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