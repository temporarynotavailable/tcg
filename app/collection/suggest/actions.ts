"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function suggestCardAction(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "").trim();
  const setName = String(formData.get("setName") ?? "").trim();
  const cardName = String(formData.get("cardName") ?? "").trim();
  const cardNumber = String(formData.get("cardNumber") ?? "").trim();
  const rarity = String(formData.get("rarity") ?? "").trim();
  const language = String(formData.get("language") ?? "EN").trim();
  const finish = String(formData.get("finish") ?? "Normal").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!gameId) {
    throw new Error("Bitte wähle ein TCG aus.");
  }

  if (!setName) {
    throw new Error("Bitte gib ein Set an.");
  }

  if (!cardName) {
    throw new Error("Bitte gib einen Kartennamen an.");
  }

  const user = await prisma.user.findFirst({
    where: {
      username: "CardVault",
    },
  });

  if (!user) {
    throw new Error("Demo-User CardVault wurde nicht gefunden. Bitte Seed erneut ausführen.");
  }

  let cardSet = await prisma.cardSet.findFirst({
    where: {
      gameId,
      name: setName,
    },
  });

  if (!cardSet) {
    cardSet = await prisma.cardSet.create({
      data: {
        gameId,
        name: setName,
        code: setName
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 8),
      },
    });
  }

  const card = await prisma.card.create({
    data: {
      gameId,
      setId: cardSet.id,
      name: cardName,
      cardNumber: cardNumber || null,
      rarity: rarity || null,
      metadata: JSON.stringify({
        notes,
        suggestedBy: user.username,
        source: "community_suggestion",
      }),
      moderationStatus: "PENDING",
      createdByUserId: user.id,
    },
  });

  await prisma.cardVariant.create({
    data: {
      cardId: card.id,
      language,
      finish,
      edition: "Community Suggestion",
      productType: "CARD",
    },
  });

  revalidatePath("/admin");
revalidatePath("/pokemon/collection");
revalidatePath("/one-piece/collection");
revalidatePath("/magic/collection");
revalidatePath("/lorcana/collection");
revalidatePath("/yu-gi-oh/collection");
revalidatePath("/pokemon/collection/add");
revalidatePath("/pokemon/collection/suggest");
revalidatePath("/one-piece/collection/add");
revalidatePath("/one-piece/collection/suggest");
revalidatePath("/magic/collection/add");
revalidatePath("/magic/collection/suggest");
revalidatePath("/lorcana/collection/add");
revalidatePath("/lorcana/collection/suggest");
revalidatePath("/yu-gi-oh/collection/add");
revalidatePath("/yu-gi-oh/collection/suggest");

  redirect("/admin");
}