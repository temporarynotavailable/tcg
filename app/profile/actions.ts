"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

async function setUserPreferenceCookies(input: {
  userId: string;
  displayName: string;
  favoriteGameSlug: string;
  interestedGameSlugs: string[];
}) {
  const cookieStore = await cookies();

  cookieStore.set("tcg_user_id", input.userId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  cookieStore.set("tcg_user_display_name", input.displayName, {
    path: "/",
    sameSite: "lax",
  });

  cookieStore.set("tcg_favorite_game_slug", input.favoriteGameSlug, {
    path: "/",
    sameSite: "lax",
  });

  cookieStore.set(
    "tcg_interested_game_slugs",
    input.interestedGameSlugs.join(","),
    {
      path: "/",
      sameSite: "lax",
    },
  );
}

export async function updateUserTcgPreferencesAction(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("tcg_user_id")?.value;

  if (!userId) {
    redirect("/");
  }

  const interestedGameIds = formData
    .getAll("interestedGameIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const uniqueInterestedGameIds = [...new Set(interestedGameIds)];
  const favoriteGameId = String(formData.get("favoriteGameId") ?? "").trim();

  if (uniqueInterestedGameIds.length === 0) {
    throw new Error("Bitte wähle mindestens ein TCG aus.");
  }

  if (!favoriteGameId) {
    throw new Error("Bitte wähle ein Favourite-TCG aus.");
  }

  if (!uniqueInterestedGameIds.includes(favoriteGameId)) {
    throw new Error("Das Favourite-TCG muss in deiner Auswahl enthalten sein.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    redirect("/");
  }

  const games = await prisma.game.findMany({
    where: {
      id: {
        in: uniqueInterestedGameIds,
      },
      isActive: true,
    },
  });

  if (games.length !== uniqueInterestedGameIds.length) {
    throw new Error("Mindestens ein ausgewähltes TCG wurde nicht gefunden.");
  }

  const favoriteGame = games.find((game) => game.id === favoriteGameId);

  if (!favoriteGame) {
    throw new Error("Favourite-TCG wurde nicht gefunden.");
  }

  await prisma.$transaction([
    prisma.userGamePreference.deleteMany({
      where: {
        userId,
      },
    }),

    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        favoriteGameId: favoriteGame.id,
        gamePreferences: {
          create: games.map((game) => ({
            gameId: game.id,
            isFavorite: game.id === favoriteGame.id,
          })),
        },
      },
    }),
  ]);

  await setUserPreferenceCookies({
    userId,
    displayName: user.displayName ?? user.username,
    favoriteGameSlug: favoriteGame.slug,
    interestedGameSlugs: games.map((game) => game.slug),
  });

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath(`/${favoriteGame.slug}/dashboard`);

  redirect("/profile");
}

export async function logoutUserAction() {
  const cookieStore = await cookies();

  cookieStore.delete("tcg_user_id");
  cookieStore.delete("tcg_user_display_name");
  cookieStore.delete("tcg_favorite_game_slug");
  cookieStore.delete("tcg_interested_game_slugs");

  revalidatePath("/");
  revalidatePath("/profile");

  redirect("/");
}