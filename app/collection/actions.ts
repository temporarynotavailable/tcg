"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  if (!value) return fallback;

  const normalized = String(value)
    .replace("€", "")
    .replace(",", ".")
    .trim();

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseQuantity(value: FormDataEntryValue | null) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 1;
  }

  return parsed;
}

export async function addCollectionItemAction(formData: FormData) {
  const cardVariantId = String(formData.get("cardVariantId") ?? "").trim();
  const condition = String(formData.get("condition") ?? "NEAR_MINT").trim();
  const quantity = parseQuantity(formData.get("quantity"));
  const acquiredPrice = parseNumber(formData.get("acquiredPrice"), 0);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!cardVariantId) {
    throw new Error("Bitte wähle eine Karte aus.");
  }

  const user = await prisma.user.findFirst({
    where: {
      username: "CardVault",
    },
  });

  if (!user) {
    throw new Error("Demo-User CardVault wurde nicht gefunden. Bitte Seed erneut ausführen.");
  }
const cardVariant = await prisma.cardVariant.findUnique({
  where: {
    id: cardVariantId,
  },
  include: {
    card: {
      include: {
        game: true,
      },
    },
  },
});

if (!cardVariant) {
  throw new Error("Kartenvariante wurde nicht gefunden.");
}
const existingItem = await prisma.collectionItem.findFirst({
  where: {
    userId: user.id,
    cardVariantId,
    condition,
    gameId: cardVariant.card.gameId,
  },
});

  if (existingItem) {
    await prisma.collectionItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: existingItem.quantity + quantity,
        acquiredPrice: acquiredPrice > 0 ? acquiredPrice : existingItem.acquiredPrice,
        notes: notes || existingItem.notes,
      },
    });
  } else {
await prisma.collectionItem.create({
  data: {
    userId: user.id,
    cardVariantId,
    gameId: cardVariant.card.gameId,
    quantity,
        condition,
        acquiredPrice: acquiredPrice > 0 ? acquiredPrice : null,
        notes: notes || null,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/decks");

revalidatePath(`/${cardVariant.card.game.slug}/collection`);

redirect(`/${cardVariant.card.game.slug}/collection`);
}