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
    gameSlug: "pokemon",
    title: "Pokémon: Deckbuilding und Singles im Fokus",
    category: "Deck Watch",
    date: "Aktuell",
    text: "Spielbare Karten und Sammlerfavoriten bleiben wichtige Signale für Collection und Marketplace.",
    href: "/pokemon/decks",
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
    gameSlug: "one-piece",
    title: "One Piece: Meta-Decks und Leaders beobachten",
    category: "Meta Watch",
    date: "Aktuell",
    text: "Neue Leader und Deck Cores können stark beeinflussen, welche Karten kurzfristig gesucht werden.",
    href: "/one-piece/decks",
  },
  {
    gameSlug: "magic",
    title: "Magic: Commander, Staples und Set-Rotation",
    category: "Deck Watch",
    date: "Aktuell",
    text: "Commander-Staples und neue Set-Signale können starke Auswirkungen auf Deckpreise haben.",
    href: "/magic/decks",
  },
  {
    gameSlug: "magic",
    title: "Magic: Singles und Collection-Wert im Blick",
    category: "Collection Watch",
    date: "Aktuell",
    text: "Staples, Reprints und Formatbewegungen bleiben wichtig für langfristige Sammlungswerte.",
    href: "/magic/marketplace",
  },
  {
    gameSlug: "lorcana",
    title: "Lorcana: Legendary Characters und Set-Neuheiten",
    category: "Collector Watch",
    date: "Aktuell",
    text: "Neue Charakterkarten und begehrte Raritäten können schnell Aufmerksamkeit im Markt erzeugen.",
    href: "/lorcana/marketplace",
  },
  {
    gameSlug: "lorcana",
    title: "Lorcana: Collection-Aufbau für neue Spieler",
    category: "Collection Watch",
    date: "Aktuell",
    text: "Für neue Sammler ist eine saubere Set- und Kartenstruktur besonders wichtig.",
    href: "/lorcana/collection",
  },
  {
    gameSlug: "yu-gi-oh",
    title: "Yu-Gi-Oh!: Staples, Deck Cores und Rarity-Hunting",
    category: "Staple Watch",
    date: "Aktuell",
    text: "Staples und Deck Cores bleiben wichtige Bereiche für Spieler und Sammler.",
    href: "/yu-gi-oh/marketplace",
  },
  {
    gameSlug: "yu-gi-oh",
    title: "Yu-Gi-Oh!: Deckbuilding und Meta-Kerne",
    category: "Deck Watch",
    date: "Aktuell",
    text: "Deck Cores, Engines und Side-Deck-Staples sind starke Signale für den nächsten Ausbau.",
    href: "/yu-gi-oh/decks",
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
    gameSlug: "pokemon",
    card: "Pikachu Promos",
    reason: "Sammlerfavorit mit hoher Aufmerksamkeit",
    signal: "Collector",
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
    gameSlug: "one-piece",
    card: "Manga Rares",
    reason: "High-End Collector Target mit starker Nachfrage",
    signal: "Collector",
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
    gameSlug: "magic",
    card: "Format Staples",
    reason: "Spielbare Karten reagieren oft stark auf Meta-Änderungen",
    signal: "Meta",
    trend: "+",
  },
  {
    gameSlug: "lorcana",
    card: "Legendary Characters",
    reason: "Sammlerinteresse und Set-Neuheiten",
    signal: "Collector",
    trend: "+",
  },
  {
    gameSlug: "lorcana",
    card: "Enchanted Cards",
    reason: "Premium-Raritäten bleiben für Sammler spannend",
    signal: "Premium",
    trend: "+",
  },
  {
    gameSlug: "yu-gi-oh",
    card: "Staple Hand Traps",
    reason: "Spielbare Staples bleiben dauerhaft relevant",
    signal: "Staple",
    trend: "↔",
  },
  {
    gameSlug: "yu-gi-oh",
    card: "Deck Core Engines",
    reason: "Meta-Kerne können kurzfristig stark nachgefragt werden",
    signal: "Meta Watch",
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

function parseSlugCookie(value: string | undefined) {
  if (!value) return [];

  return value
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

export default async function HomePage() {
  const games = await prisma.game.findMany({
    where: {
      isActive: true,
    },
  });

  const cookieStore = await cookies();

  const interestedGameSlugs = parseSlugCookie(
    cookieStore.get("tcg_interested_game_slugs")?.value,
  );

  const favoriteGameSlugCookie = cookieStore.get("tcg_favorite_game_slug")?.value;

  const visibleGames =
    interestedGameSlugs.length > 0
      ? games.filter((game) => interestedGameSlugs.includes(game.slug))
      : games;

  const sortedGames = sortGames(visibleGames);

  const availableGameSlugs = sortedGames.map((game) => game.slug);

  const fallbackGameSlug = sortedGames[0]?.slug ?? "pokemon";

  const favoriteGameSlug =
    favoriteGameSlugCookie && availableGameSlugs.includes(favoriteGameSlugCookie)
      ? favoriteGameSlugCookie
      : fallbackGameSlug;

  const visibleNewsFeed =
    availableGameSlugs.length > 0
      ? newsFeed.filter((news) => availableGameSlugs.includes(news.gameSlug))
      : newsFeed;

  const visibleHotPicks =
    availableGameSlugs.length > 0
      ? hotPicks.filter((pick) => availableGameSlugs.includes(pick.gameSlug))
      : hotPicks;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-7xl px-6 py-6 md:py-8">
        <header className="mb-6 rounded-[2rem] border bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
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

            <div className="flex flex-wrap items-center justify-end gap-3">
              <HomePreferences />

              <HomeAuthActions
                games={sortGames(games).map((game) => ({
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

              {interestedGameSlugs.length > 0 && (
                <p className="mt-3 text-sm text-slate-500">
                  Deine Startseite ist auf deine ausgewählten TCGs gefiltert.
                  Favourite:{" "}
                  <span className="font-medium text-slate-950">
                    {getGameLabel(favoriteGameSlug)}
                  </span>
                  .
                </p>
              )}
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
                    {interestedGameSlugs.length > 0
                      ? "Gefiltert nach deinen ausgewählten TCGs."
                      : "Schlanker Demo-Feed. Später können wir echte Newsquellen, Admin-News oder RSS/API-Feeds anbinden."}
                  </p>
                </div>

                <Button variant="outline" asChild>
                  <Link href={`/${favoriteGameSlug}/marketplace`}>
                    Markt beobachten
                    <Search className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                {visibleNewsFeed.map((news) => (
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
                {interestedGameSlugs.length > 0
                  ? "Watchlist passend zu deinen ausgewählten TCGs."
                  : "Demo-Watchlist für Karten, Set-Themen und Archetypes mit aktueller Aufmerksamkeit."}
              </p>

              <div className="mt-6 space-y-3">
                {visibleHotPicks.map((pick) => (
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