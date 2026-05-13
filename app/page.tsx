import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Flame,
  Gamepad2,
  Newspaper,
  Search,
  TrendingUp,
} from "lucide-react";

import { HomeAuthActions } from "@/components/home/home-auth-actions";
import { HomePreferences } from "@/components/home/home-preferences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const gameOrder = ["pokemon", "one-piece", "magic", "lorcana", "yu-gi-oh"];

const gameStyles: Record<
  string,
  {
    shortLabel: string;
  }
> = {
  pokemon: {
    shortLabel: "Pokémon",
  },
  "one-piece": {
    shortLabel: "One Piece",
  },
  magic: {
    shortLabel: "Magic",
  },
  lorcana: {
    shortLabel: "Lorcana",
  },
  "yu-gi-oh": {
    shortLabel: "Yu-Gi-Oh!",
  },
};

const newsFeed = [
  {
    gameSlug: "pokemon",
    title: "Pokémon TCG: neue Produkte und Meta-Bewegung",
    category: "Release Watch",
    date: "Aktuell",
    text: "Neue Produkte, Deckideen und Sammlerinteresse sorgen regelmäßig für Bewegung im Markt.",
    href: "/pokemon/marketplace",
  },
  {
    gameSlug: "one-piece",
    title: "One Piece TCG: Binder, Leaders und Set-Hype",
    category: "Market Watch",
    date: "Aktuell",
    text: "Leader-Karten, Alt Arts und komplette Binder bleiben spannende Marktbereiche.",
    href: "/one-piece/marketplace",
  },
  {
    gameSlug: "magic",
    title: "Magic: Commander, Staples und Set-Rotation",
    category: "Deck Watch",
    date: "Aktuell",
    text: "Commander-Staples und neue Set-Signale können starke Auswirkungen auf Deckpreise haben.",
    href: "/magic/decks",
  },
];

const hotPicks = [
  {
    gameSlug: "pokemon",
    card: "Mega Lucario ex",
    reason: "Release-Hype und spielbarer Deck-Fokus",
    signal: "Watch",
    trend: "+",
  },
  {
    gameSlug: "one-piece",
    card: "OP Leaders & Alt Arts",
    reason: "Leader-Karten bleiben starke Binder- und Meta-Kandidaten",
    signal: "Meta Watch",
    trend: "+",
  },
  {
    gameSlug: "magic",
    card: "Commander Staples",
    reason: "Langfristige Nachfrage durch Deckbuilding",
    signal: "Staple",
    trend: "↔",
  },
  {
    gameSlug: "lorcana",
    card: "Legendary Characters",
    reason: "Sammlerinteresse und Set-Neuheiten",
    signal: "Collector",
    trend: "+",
  },
];

function getGameLabel(slug: string) {
  return gameStyles[slug]?.shortLabel ?? slug;
}

function sortGames<T extends { slug: string }>(games: T[]) {
  return [...games].sort((a, b) => {
    const aIndex = gameOrder.indexOf(a.slug);
    const bIndex = gameOrder.indexOf(b.slug);

    if (aIndex === -1 && bIndex === -1) return a.slug.localeCompare(b.slug);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });
}

export default async function HomePage() {
  const games = await prisma.game.findMany({
    where: {
      isActive: true,
    },
  });

  const cookieStore = await cookies();
const interestedGameSlugsCookie = cookieStore.get("tcg_interested_game_slugs")?.value;

const interestedGameSlugs =
  interestedGameSlugsCookie
    ?.split(",")
    .map((slug) => slug.trim())
    .filter(Boolean) ?? [];

const visibleGames =
  interestedGameSlugs.length > 0
    ? games.filter((game) => interestedGameSlugs.includes(game.slug))
    : games;

const sortedGames = sortGames(visibleGames);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-7xl px-6 py-6 md:py-8">
        <header className="mb-6 rounded-[2rem] border bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Gamepad2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-base font-semibold tracking-tight">
                  TCG Nexus
                </p>
                <p className="text-xs text-slate-500">
                  Game-scoped trading platform
                </p>
              </div>
            </Link>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <HomePreferences />

              <HomeAuthActions
  games={sortedGames.map((game) => ({
    id: game.id,
    name: game.name,
    slug: game.slug,
  }))}
/>
            </div>
          </div>
        </header>

        <div className="rounded-[2rem] border bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <Badge className="mb-5 rounded-full px-4 py-1">
                TCG Nexus · Game Hub
              </Badge>

              <h1 className="max-w-5xl text-5xl font-semibold tracking-tight md:text-7xl">
                Wähle dein TCG.
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                Starte direkt in deinen getrennten TCG-Bereich. Jeder Bereich
                hat eigenes Dashboard, Collection, Marketplace, Sell Flow,
                Orders und Decks.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-slate-950 text-white">
              <Gamepad2 className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {sortedGames.map((game) => (
              <Button key={game.id} size="lg" asChild>
                <Link href={`/${game.slug}/dashboard`}>
                  {getGameLabel(game.slug)}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <Badge className="mb-3 rounded-full px-4 py-1">
                    <Newspaper className="mr-2 h-4 w-4" />
                    TCG News Feed
                  </Badge>

                  <h2 className="text-2xl font-semibold">
                    Was gerade los ist
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Schlanker Demo-Feed. Später können wir echte Newsquellen,
                    Admin-News oder RSS/API-Feeds anbinden.
                  </p>
                </div>

                <Button variant="outline" asChild>
                  <Link href="/pokemon/marketplace">
                    Markt beobachten
                    <Search className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                {newsFeed.map((news) => (
                  <Link
                    key={`${news.gameSlug}-${news.title}`}
                    href={news.href}
                    className="block rounded-3xl border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">
                            {getGameLabel(news.gameSlug)}
                          </Badge>

                          <Badge variant="secondary">{news.category}</Badge>

                          <span className="flex items-center text-xs text-slate-500">
                            <CalendarDays className="mr-1 h-3 w-3" />
                            {news.date}
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-semibold">
                          {news.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {news.text}
                        </p>
                      </div>

                      <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-slate-950 text-white">
            <CardContent className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Flame className="h-6 w-6" />
              </div>

              <Badge variant="secondary" className="mb-4 rounded-full">
                Hot Picks
              </Badge>

              <h2 className="text-2xl font-semibold">Karten im Blick</h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Demo-Watchlist für Karten, Set-Themen und Archetypes mit
                aktueller Aufmerksamkeit.
              </p>

              <div className="mt-6 space-y-3">
                {hotPicks.map((pick) => (
                  <Link
                    key={`${pick.gameSlug}-${pick.card}`}
                    href={`/${pick.gameSlug}/marketplace`}
                    className="block rounded-2xl bg-white/10 p-4 transition hover:bg-white/15"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {getGameLabel(pick.gameSlug)}
                          </Badge>

                          <Badge
                            variant="outline"
                            className="border-white/20 text-white"
                          >
                            {pick.signal}
                          </Badge>
                        </div>

                        <p className="font-semibold">{pick.card}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          {pick.reason}
                        </p>
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                        {pick.trend === "+" ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <BarChart3 className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}