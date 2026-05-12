"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { calculateListingRisk } from "@/lib/listing-risk";
import { prisma } from "@/lib/prisma";

function parsePrice(value: FormDataEntryValue | null) {
  if (!value) return 0;

  const normalized = String(value)
    .replace("€", "")
    .replace(",", ".")
    .trim();

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function mapListingType(value: FormDataEntryValue | null) {
  const type = String(value ?? "single-card");

  const map: Record<string, string> = {
    "single-card": "SINGLE_CARD",
    sealed: "SEALED_PRODUCT",
    deck: "DECK",
    binder: "BINDER",
    collection: "COLLECTION",
  };

  return map[type] ?? "SINGLE_CARD";
}

export async function createListingAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const listingType = mapListingType(formData.get("listingType"));
  const price = parsePrice(formData.get("price"));
  const cardVariantId = String(formData.get("cardVariantId") ?? "").trim();
  const selectedGameId = String(formData.get("gameId") ?? "").trim();

  if (!title) {
    throw new Error("Titel fehlt.");
  }

  if (price <= 0) {
    throw new Error("Preis muss größer als 0 sein.");
  }

  const seller = await prisma.user.findFirst({
    where: {
      username: "CardVault",
    },
  });

  if (!seller) {
    throw new Error("Demo-User CardVault wurde nicht gefunden. Bitte Seed erneut ausführen.");
  }

  const risk = calculateListingRisk({
    listingType,
    price,
    sellerRole: seller.role,
    kycStatus: seller.kycStatus,
    reputationScore: seller.reputationScore,
    trustLevel: seller.trustLevel,
  });
let gameId: string | null = selectedGameId || null;

if (!gameId && cardVariantId) {
  const cardVariant = await prisma.cardVariant.findUnique({
    where: {
      id: cardVariantId,
    },
    include: {
      card: true,
    },
  });

  gameId = cardVariant?.card.gameId ?? null;
}
  await prisma.listing.create({
data: {
  sellerId: seller.id,
  gameId,
  listingType,
      title,
      description,
      price,
      currency: "EUR",
      status: risk.recommendedStatus,
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      riskReasons: JSON.stringify(risk.reasons),

      items:
        listingType === "SINGLE_CARD" && cardVariantId
          ? {
              create: {
                cardVariantId,
                quantity: 1,
                condition: "NEAR_MINT",
                language: "DE",
              },
            }
          : undefined,

      binderSale:
        listingType === "BINDER"
          ? {
              create: {
                estimatedValue: price,
                detectedCardCount: 0,
                confirmedCardCount: 0,
              },
            }
          : undefined,
    },
  });

  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  revalidatePath("/sell");
  revalidatePath("/admin");

  const selectedGame = gameId
  ? await prisma.game.findUnique({
      where: {
        id: gameId,
      },
    })
  : null;

const gameQuery = selectedGame?.slug ? `?game=${selectedGame.slug}` : "";

redirect(
  risk.recommendedStatus === "ACTIVE"
    ? `/marketplace${gameQuery}`
    : "/admin",
);
}