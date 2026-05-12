"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function updateListingStatusAction(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "");
  const status = String(formData.get("status") ?? "");

  const allowedStatuses = ["DRAFT", "REVIEW", "ACTIVE", "SOLD", "PAUSED", "REJECTED"];

  if (!listingId) {
    throw new Error("Listing ID fehlt.");
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Ungültiger Listing-Status.");
  }

  await prisma.listing.update({
    where: {
      id: listingId,
    },
    data: {
      status,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
}

export async function updateCardModerationStatusAction(formData: FormData) {
  const cardId = String(formData.get("cardId") ?? "");
  const moderationStatus = String(formData.get("moderationStatus") ?? "");

  const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];

  if (!cardId) {
    throw new Error("Card ID fehlt.");
  }

  if (!allowedStatuses.includes(moderationStatus)) {
    throw new Error("Ungültiger Kartenstatus.");
  }

  await prisma.card.update({
    where: {
      id: cardId,
    },
    data: {
      moderationStatus,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/collection");
  revalidatePath("/collection/add");
  revalidatePath("/marketplace");
}