"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function createDeckAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const gameId = String(formData.get("gameId") ?? "").trim();
  const gameSlug = String(formData.get("gameSlug") ?? "").trim();

  if (!name) {
    throw new Error("Bitte gib einen Decknamen an.");
  }

  if (!gameId) {
    throw new Error("TCG fehlt.");
  }

  if (!gameSlug) {
    throw new Error("Game Slug fehlt.");
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
  });

  if (!game) {
    throw new Error("TCG wurde nicht gefunden.");
  }

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: "CardVault",
        },
        {
          email: "cardvault@tcgnexus.local",
        },
      ],
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "cardvault@tcgnexus.local",
        username: "CardVault",
        displayName: "CardVault",
        role: "TRUSTED_MEMBER",
        kycStatus: "VERIFIED",
        reputationScore: 85,
        trustLevel: 3,
      },
    });
  }

  await prisma.deck.create({
    data: {
      name,
      gameId: game.id,
      userId: user.id,
    },
  });

  revalidatePath(`/${gameSlug}/decks`);
  revalidatePath(`/${gameSlug}/dashboard`);

  redirect(`/${gameSlug}/decks`);
}