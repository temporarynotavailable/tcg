"use server";

import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

const PASSWORD_ITERATIONS = 120_000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = "sha512";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");

  const hash = pbkdf2Sync(
    password,
    salt,
    PASSWORD_ITERATIONS,
    PASSWORD_KEY_LENGTH,
    PASSWORD_DIGEST,
  ).toString("hex");

  return `pbkdf2_${PASSWORD_DIGEST}$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsRaw, salt, hash] = storedHash.split("$");

  if (!algorithm?.startsWith("pbkdf2_") || !iterationsRaw || !salt || !hash) {
    return false;
  }

  const digest = algorithm.replace("pbkdf2_", "");
  const iterations = Number(iterationsRaw);

  if (!Number.isFinite(iterations)) {
    return false;
  }

  const calculatedHash = pbkdf2Sync(
    password,
    salt,
    iterations,
    Buffer.from(hash, "hex").length,
    digest,
  );

  const storedHashBuffer = Buffer.from(hash, "hex");

  if (calculatedHash.length !== storedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(calculatedHash, storedHashBuffer);
}

async function setUserSessionCookies(input: {
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

export async function registerUserAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const favoriteGameId = String(formData.get("favoriteGameId") ?? "").trim();

  const interestedGameIds = formData
    .getAll("interestedGameIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const uniqueInterestedGameIds = [...new Set(interestedGameIds)];

  if (!username) {
    throw new Error("Bitte gib einen Username an.");
  }

  if (!displayName) {
    throw new Error("Bitte gib einen Anzeigenamen an.");
  }

  if (!email) {
    throw new Error("Bitte gib eine E-Mail-Adresse an.");
  }

  if (password.length < 8) {
    throw new Error("Das Passwort muss mindestens 8 Zeichen lang sein.");
  }

  if (uniqueInterestedGameIds.length === 0) {
    throw new Error("Bitte wähle mindestens ein TCG aus.");
  }

  if (!favoriteGameId) {
    throw new Error("Bitte wähle ein Favourite-TCG aus.");
  }

  if (!uniqueInterestedGameIds.includes(favoriteGameId)) {
    throw new Error("Das Favourite-TCG muss in deiner Auswahl enthalten sein.");
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

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email,
        },
        {
          username,
        },
      ],
    },
  });

  if (existingUser) {
    throw new Error("E-Mail oder Username ist bereits vergeben.");
  }

  const user = await prisma.user.create({
    data: {
      email,
      username,
      displayName,
      passwordHash: hashPassword(password),
      favoriteGameId: favoriteGame.id,
      role: "BASIC_USER",
      kycStatus: "PENDING",
      reputationScore: 0,
      trustLevel: 1,
      gamePreferences: {
        create: games.map((game) => ({
          gameId: game.id,
          isFavorite: game.id === favoriteGame.id,
        })),
      },
    },
  });

  await setUserSessionCookies({
    userId: user.id,
    displayName: user.displayName ?? user.username,
    favoriteGameSlug: favoriteGame.slug,
    interestedGameSlugs: games.map((game) => game.slug),
  });

  redirect(`/${favoriteGame.slug}/dashboard`);
}

export async function loginUserAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    throw new Error("Bitte gib deine E-Mail-Adresse an.");
  }

  if (!password) {
    throw new Error("Bitte gib dein Passwort ein.");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      favoriteGame: true,
      gamePreferences: {
        include: {
          game: true,
        },
      },
    },
  });

  if (!user || !user.passwordHash) {
    throw new Error("Login fehlgeschlagen.");
  }

  const isValidPassword = verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error("Login fehlgeschlagen.");
  }

  const fallbackGame = await prisma.game.findFirst({
    where: {
      slug: "pokemon",
      isActive: true,
    },
  });

  const favoriteGame =
    user.favoriteGame ??
    user.gamePreferences.find((preference) => preference.isFavorite)?.game ??
    user.gamePreferences[0]?.game ??
    fallbackGame;

  if (!favoriteGame) {
    throw new Error("Für diesen Account ist kein Standard-TCG hinterlegt.");
  }

  const interestedGameSlugs =
    user.gamePreferences.length > 0
      ? user.gamePreferences.map((preference) => preference.game.slug)
      : [favoriteGame.slug];

  await setUserSessionCookies({
    userId: user.id,
    displayName: user.displayName ?? user.username,
    favoriteGameSlug: favoriteGame.slug,
    interestedGameSlugs,
  });

  redirect(`/${favoriteGame.slug}/dashboard`);
}