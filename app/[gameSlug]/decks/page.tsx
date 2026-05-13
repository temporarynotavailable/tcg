import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Layers3,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";

import { createDeckAction } from "@/app/decks/actions";
import { CardImagePreview } from "@/components/cards/card-image-preview";
import { GameAreaSwitcher } from "@/components/games/game-area-switcher";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getGameByRouteSlug,
  getGamesForNavigation,
} from "@/lib/game-routing";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type GameDecksPageProps = {
  params: Promise<{
    gameSlug: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function getPlayRatingLabel(rating: number) {
  if (rating >= 8.5) return "Meta Core";
  if (rating >= 7.5) return "Competitive";
  if (rating >= 6.5) return "Playable";
  if (rating > 0) return "Casual";

  return "Unrated";
}

export default async function GameDecksPage({ params }: GameDecksPageProps) {
  const { gameSlug } = await params;

  const selectedGame = await getGameByRouteSlug(gameSlug);
  const games = await getGamesForNavigation();

  const deck = await prisma.deck.findFirst({
    where: {
      gameId: selectedGame.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      game: true,
      cards: {
        include: {
          cardVariant: {
            include: {
              collectionItems: true,
              priceSnapshots: {
                orderBy: {
                  date: "desc",
                },
                take: 1,
              },
              card: {
                include: {
                  game: true,
                  set: true,
                  playRatings: {
                    orderBy: {
                      lastUpdated: "desc",
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const availableCollectionItems = await prisma.collectionItem.findMany({
    where: {
      gameId: selectedGame.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
    include: {
      cardVariant: {
        include: {
          priceSnapshots: {
            orderBy: {
              date: "desc",
            },
            take: 1,
          },
          card: {
            include: {
              game: true,
              set: true,
              playRatings: {
                orderBy: {
                  lastUpdated: "desc",
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  const deckCards = deck?.cards ?? [];

  const deckValue = deckCards.reduce((sum, deckCard) => {
    const latestPrice = deckCard.cardVariant.priceSnapshots[0];

    return sum + (latestPrice?.normalizedPrice ?? 0);
  }, 0);

  const playRatings = deckCards
    .map((deckCard) => deckCard.cardVariant.card.playRatings[0]?.rating ?? 0)
    .filter((rating) => rating > 0);

  const averagePlayRating =
    playRatings.length > 0
      ? playRatings.reduce((sum, rating) => sum + rating, 0) /
        playRatings.length
      : 0;

  const ownedDeckCards = deckCards.filter(
    (deckCard) => deckCard.cardVariant.collectionItems.length > 0,
  ).length;

  const completionRate =
    deckCards.length > 0
      ? Math.round((ownedDeckCards / deckCards.length) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pt-8">
        <GameAreaSwitcher
          games={games}
          selectedGame={selectedGame}
          sectionPath="/decks"
        />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Badge className="mb-4 rounded-full px-4 py-1">
              Deck Builder · {selectedGame.name}
            </Badge>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Turnierdecks
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Decks sind jetzt sauber nach TCG getrennt. Dieser Bereich zeigt
              nur Decks, Karten und Collection-Daten für{" "}
              <span className="font-medium text-slate-950">
                {selectedGame.name}
              </span>
              .
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={`/${selectedGame.slug}/collection`}>
                Sammlung öffnen
              </Link>
            </Button>

            <Button asChild>
              <Link href={`/${selectedGame.slug}/sell`}>
                Deck verkaufen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <Trophy className="h-5 w-5" />
              </div>

              <p className="text-sm text-slate-500">Aktives Deck</p>
              <p className="mt-2 text-3xl font-semibold">{deck ? "1" : "0"}</p>
              <p className="mt-4 text-sm text-slate-500">
                {deck?.name ?? "Noch kein Deck vorhanden"}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Layers3 className="h-5 w-5" />
              </div>

              <p className="text-sm text-slate-500">Deck Cards</p>
              <p className="mt-2 text-3xl font-semibold">{deckCards.length}</p>
              <p className="mt-4 text-sm text-slate-500">
                Karten im aktuellen Deck
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <p className="text-sm text-slate-500">Collection Match</p>
              <p className="mt-2 text-3xl font-semibold">{completionRate}%</p>
              <p className="mt-4 text-sm text-slate-500">
                {ownedDeckCards}/{deckCards.length} Karten vorhanden
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-slate-950 text-white">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <BarChart3 className="h-5 w-5" />
              </div>

              <p className="text-sm text-slate-400">Deck Value</p>
              <p className="mt-2 text-3xl font-semibold">
                {deckValue > 0 ? formatCurrency(deckValue) : "—"}
              </p>
              <p className="mt-4 text-sm text-slate-400">
                Ø Play Rating{" "}
                {averagePlayRating > 0 ? averagePlayRating.toFixed(1) : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <Badge className="mb-4 rounded-full px-4 py-1">
                  Deck erstellen · {selectedGame.name}
                </Badge>

                <h2 className="text-2xl font-semibold">
                  Neues Deck erstellen
                </h2>

                <p className="mt-2 max-w-2xl text-slate-600">
                  Erstelle ein neues Deck im Bereich{" "}
                  <span className="font-medium text-slate-950">
                    {selectedGame.name}
                  </span>
                  . Karten zum Deck hinzufügen bauen wir im nächsten Schritt.
                </p>
              </div>

              <form
                action={createDeckAction}
                className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto"
              >
                <input type="hidden" name="gameId" value={selectedGame.id} />
                <input
                  type="hidden"
                  name="gameSlug"
                  value={selectedGame.slug}
                />

                <input
                  name="name"
                  required
                  placeholder={`${selectedGame.name} Deck`}
                  className="h-11 min-w-72 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                />

                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Deck erstellen
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {deck ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <h2 className="text-2xl font-semibold">{deck.name}</h2>
                    <p className="mt-2 max-w-2xl text-slate-600">
                      Dieses Deck ist dem TCG{" "}
                      <span className="font-medium text-slate-950">
                        {selectedGame.name}
                      </span>{" "}
                      zugeordnet und dient als Grundlage für den Deck Builder.
                    </p>
                  </div>

                  <Badge variant="outline" className="rounded-full">
                    {deck.game.name}
                  </Badge>
                </div>

                <div className="mt-6 space-y-4">
                  {deckCards.map((deckCard) => {
                    const variant = deckCard.cardVariant;
                    const card = variant.card;
                    const latestPrice = variant.priceSnapshots[0];
                    const playRating = card.playRatings[0]?.rating ?? 0;
                    const isOwned = variant.collectionItems.length > 0;

                    return (
                      <div
                        key={deckCard.id}
                        className="flex flex-col justify-between gap-4 rounded-3xl border bg-white p-4 md:flex-row md:items-center"
                      >
                        <div className="flex items-center gap-4">
                          <CardImagePreview
                            src={card.imageUrl}
                            alt={card.name}
                            className="h-24 w-16 rounded-2xl"
                          >
                            <Sparkles className="h-6 w-6 text-slate-400" />
                          </CardImagePreview>

                          <div>
                            <p className="font-semibold">{card.name}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {card.set?.name ?? "Unknown Set"} ·{" "}
                              {card.cardNumber ?? "—"} · {variant.language}
                              {variant.finish ? ` · ${variant.finish}` : ""}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="outline">
                                {getPlayRatingLabel(playRating)}
                              </Badge>

                              {playRating > 0 && (
                                <Badge variant="outline">
                                  Play Rating {playRating.toFixed(1)}
                                </Badge>
                              )}

                              <Badge
                                variant="outline"
                                className={
                                  isOwned
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-amber-200 bg-amber-50 text-amber-700"
                                }
                              >
                                {isOwned ? "In Sammlung" : "Fehlt"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="font-semibold">
                            {latestPrice
                              ? formatCurrency(latestPrice.normalizedPrice)
                              : "—"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Preisreferenz
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {deckCards.length === 0 && (
                    <div className="rounded-3xl border bg-white px-6 py-12 text-center text-slate-500">
                      Dieses Deck enthält noch keine Karten.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-3xl bg-slate-950 text-white">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Trophy className="h-6 w-6" />
                  </div>

                  <h2 className="text-2xl font-semibold">
                    Deck Builder Roadmap
                  </h2>

                  <p className="mt-3 leading-7 text-slate-300">
                    Später kannst du hier Decks erstellen, Karten aus deiner
                    Sammlung hinzufügen, Play-Ratings prüfen und komplette Decks
                    zum Verkauf anbieten.
                  </p>

                  <div className="mt-6 space-y-3">
                    {[
                      "Deck aus Collection bauen",
                      "Fehlende Karten automatisch erkennen",
                      "Meta- und Play-Rating anzeigen",
                      "Ganzes Deck verkaufen",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold">
                    Collection Empfehlungen
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Karten aus deiner {selectedGame.name} Sammlung, die später
                    für Decks genutzt werden können.
                  </p>

                  <div className="mt-5 space-y-3">
                    {availableCollectionItems.slice(0, 4).map((item) => {
                      const variant = item.cardVariant;
                      const card = variant.card;
                      const rating = card.playRatings[0]?.rating ?? 0;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4"
                        >
                          <div>
                            <p className="text-sm font-medium">{card.name}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {card.set?.name ?? "Unknown Set"} · Menge{" "}
                              {item.quantity}
                            </p>
                          </div>

                          <Badge variant="outline">
                            {rating > 0 ? rating.toFixed(1) : "—"}
                          </Badge>
                        </div>
                      );
                    })}

                    {availableCollectionItems.length === 0 && (
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                        Für dieses TCG sind noch keine Collection Items
                        vorhanden.
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <Button variant="outline" asChild>
                      <Link href={`/${selectedGame.slug}/collection`}>
                        Sammlung öffnen
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="mt-8 rounded-3xl">
            <CardContent className="grid gap-6 p-8 md:grid-cols-[1fr_0.8fr] md:items-center">
              <div>
                <Badge className="mb-4 rounded-full px-4 py-1">
                  Kein Deck vorhanden
                </Badge>

                <h2 className="text-3xl font-semibold">
                  Für {selectedGame.name} gibt es noch kein Deck.
                </h2>

                <p className="mt-3 max-w-2xl text-slate-600">
                  Das ist okay. Die Route ist bereits sauber getrennt. Sobald du
                  ein Deck für dieses TCG anlegst, erscheint es hier
                  automatisch.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/${selectedGame.slug}/collection`}>
                      Sammlung öffnen
                    </Link>
                  </Button>

                  <Button variant="outline" asChild>
                    <Link href={`/${selectedGame.slug}/collection/add`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Karte hinzufügen
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-950 p-6 text-white">
                <Boxes className="mb-5 h-8 w-8" />
                <p className="text-lg font-semibold">
                  Nächster Ausbau: Karten zum Deck hinzufügen
                </p>
                <p className="mt-3 leading-7 text-slate-300">
                  Im nächsten Feature-Schritt bauen wir eine Action, mit der du
                  Karten aus deiner Collection direkt dem Deck hinzufügen kannst.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}