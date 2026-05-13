import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight,
  Gamepad2,
  LogOut,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  User,
} from "lucide-react";

import { logoutUserAction } from "@/app/profile/actions";
import { TcgPreferencesForm } from "@/components/profile/tcg-preferences-form";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getShortGameName(name: string) {
  if (name === "Magic: The Gathering") return "Magic";
  if (name === "One Piece Card Game") return "One Piece";
  if (name === "Disney Lorcana") return "Lorcana";

  return name;
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("tcg_user_id")?.value;

  const games = await prisma.game.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const user = userId
    ? await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          favoriteGame: true,
          gamePreferences: {
            include: {
              game: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })
    : null;

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <SiteHeader />

        <section className="mx-auto max-w-4xl px-6 py-16">
          <Card className="rounded-3xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-950 text-white">
                <User className="h-7 w-7" />
              </div>

              <Badge className="mb-4 rounded-full px-4 py-1">
                Kein aktiver Login
              </Badge>

              <h1 className="text-4xl font-semibold tracking-tight">
                Du bist aktuell nicht eingeloggt.
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                Öffne die Startseite und melde dich über das dynamische Login
                an. Danach kannst du hier deine TCG-Präferenzen verwalten.
              </p>

              <div className="mt-8">
                <Button asChild>
                  <Link href="/">
                    Zur Startseite
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  const selectedGameIds =
    user.gamePreferences.length > 0
      ? user.gamePreferences.map((preference) => preference.gameId)
      : games.map((game) => game.id);

  const favoriteGameId =
    user.favoriteGameId ?? selectedGameIds[0] ?? games[0]?.id ?? "";

  const favoriteGame =
    user.favoriteGame ??
    games.find((game) => game.id === favoriteGameId) ??
    null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Badge className="mb-4 rounded-full px-4 py-1">
              Profil & Preferences
            </Badge>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Willkommen, {user.displayName ?? user.username}.
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Verwalte hier dein Favourite-TCG, deine interessanten Spiele und
              später auch Sprache, Skin-Rewards, KYC und Trust-Level.
            </p>
          </div>

          <form action={logoutUserAction}>
            <Button variant="outline" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <User className="h-5 w-5" />
              </div>

              <p className="text-sm text-slate-500">Account</p>
              <p className="mt-2 text-xl font-semibold">{user.username}</p>
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <Star className="h-5 w-5" />
              </div>

              <p className="text-sm text-slate-500">Favourite-TCG</p>
              <p className="mt-2 text-xl font-semibold">
                {favoriteGame ? getShortGameName(favoriteGame.name) : "—"}
              </p>

              {favoriteGame && (
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href={`/${favoriteGame.slug}/dashboard`}>
                    Dashboard öffnen
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <p className="text-sm text-slate-500">Status</p>
              <p className="mt-2 text-xl font-semibold">{user.role}</p>
              <p className="mt-1 text-sm text-slate-500">
                KYC: {user.kycStatus}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-slate-950 text-white">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Trophy className="h-5 w-5" />
              </div>

              <p className="text-sm text-slate-400">Trust Level</p>
              <p className="mt-2 text-3xl font-semibold">{user.trustLevel}</p>
              <p className="mt-1 text-sm text-slate-400">
                Reputation {user.reputationScore}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 rounded-3xl">
          <CardContent className="p-6 md:p-8">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <Badge className="mb-4 rounded-full px-4 py-1">
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  TCG Preferences
                </Badge>

                <h2 className="text-2xl font-semibold">
                  Deine TCG-Auswahl
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Wähle aus, welche Spiele dich interessieren. Dein Favourite
                  wird beim Login automatisch als Standardbereich geladen.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Hub, News und Hot Picks werden danach auf deine Auswahl
                  gefiltert.
                </div>
              </div>
            </div>

            <TcgPreferencesForm
              games={games.map((game) => ({
                id: game.id,
                name: game.name,
                slug: game.slug,
              }))}
              initialSelectedGameIds={selectedGameIds}
              initialFavoriteGameId={favoriteGameId}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}