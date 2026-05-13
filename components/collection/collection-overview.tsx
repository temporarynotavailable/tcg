"use client";

import { CardImagePreview } from "@/components/cards/card-image-preview";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Bot,
  FilePlus2,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CollectionCard = {
  id: string;
  name: string;
  imageUrl: string | null;
  game: string;
  set: string;
  number: string;
  condition: string;
  language: string;
  quantity: number;
  value: number;
  trend: string;
  playRating: string;
  status: string;
};

type CollectionOverviewProps = {
  cards: CollectionCard[];
  basePath?: string;
};

const games = ["Alle", "Pokémon", "One Piece Card Game", "Magic: The Gathering", "Disney Lorcana", "Yu-Gi-Oh!"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatCondition(condition: string) {
  return condition
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function CollectionOverview({
  cards,
  basePath = "/pokemon/collection",
}: CollectionOverviewProps) {
  const [query, setQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("Alle");

  const availableGames = useMemo(() => {
    const uniqueGames = Array.from(new Set(cards.map((card) => card.game)));
    return ["Alle", ...uniqueGames];
  }, [cards]);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesGame = selectedGame === "Alle" || card.game === selectedGame;

      const matchesQuery =
        card.name.toLowerCase().includes(query.toLowerCase()) ||
        card.set.toLowerCase().includes(query.toLowerCase()) ||
        card.number.toLowerCase().includes(query.toLowerCase());

      return matchesGame && matchesQuery;
    });
  }, [cards, query, selectedGame]);

  const totalValue = cards.reduce((sum, card) => sum + card.value * card.quantity, 0);
  const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0);
  const averagePlayRating =
    cards.length === 0
      ? 0
      : cards.reduce((sum, card) => sum + Number(card.playRating), 0) / cards.length;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Badge className="mb-4 rounded-full px-4 py-1">
            Collection Manager v0.2 · Database Connected
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Meine Sammlung
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Deine Karten werden jetzt aus der lokalen Prisma-Datenbank geladen.
            Preise, Play Ratings und TCG-Daten kommen nicht mehr aus Dummy-Arrays.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
<Button variant="outline">
  <Bot className="mr-2 h-4 w-4" />
  AI Scan
</Button>

<Button variant="outline" asChild>
  <Link href={`${basePath}/suggest`}>
    <FilePlus2 className="mr-2 h-4 w-4" />
    Neue Karte vorschlagen
  </Link>
</Button>

<Button asChild>
  <Link href={`${basePath}/add`}>
    <Plus className="mr-2 h-4 w-4" />
    Karte hinzufügen
  </Link>
</Button>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Sammlungswert</p>
                <p className="mt-2 text-3xl font-semibold">
                  {formatCurrency(totalValue)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Aus PriceSnapshots der lokalen DB
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Karten gesamt</p>
                <p className="mt-2 text-3xl font-semibold">{totalCards}</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Über {Math.max(availableGames.length - 1, 0)} TCGs verteilt
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Ø Play Rating</p>
                <p className="mt-2 text-3xl font-semibold">
                  {averagePlayRating.toFixed(1)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Aus CardPlayRating geladen
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-slate-950 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Trust Status</p>
                <p className="mt-2 text-3xl font-semibold">Verified</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              KYC und Reputation sind im Datenmodell vorbereitet
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-semibold">Kartenübersicht</h2>
              <p className="mt-1 text-sm text-slate-500">
                Suche nach Karte, Set oder Kartennummer.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Karte suchen..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {availableGames.map((game) => (
              <Button
                key={game}
                variant={selectedGame === game ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGame(game)}
                className="rounded-full"
              >
                {game}
              </Button>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
            <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] border-b bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 lg:grid">
              <div>Karte</div>
              <div>TCG</div>
              <div>Zustand</div>
              <div>Menge</div>
              <div>Play Rating</div>
              <div className="text-right">Wert</div>
            </div>

            <div className="divide-y">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="grid gap-4 px-4 py-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] lg:items-center"
                >
<div className="flex items-center gap-4">
<CardImagePreview
  src={card.imageUrl}
  alt={card.name}
  className="h-20 w-14 rounded-xl"
>
  <Sparkles className="h-5 w-5 text-slate-400" />
</CardImagePreview>

  <div>
    <p className="font-medium">{card.name}</p>
    <p className="text-sm text-slate-500">
      {card.set} · {card.number} · {card.language}
    </p>
  </div>
</div>

                  <div>
                    <Badge variant="outline">{card.game}</Badge>
                  </div>

                  <div className="text-sm text-slate-600">
                    {formatCondition(card.condition)}
                  </div>

                  <div className="text-sm text-slate-600">{card.quantity}x</div>

                  <div>
                    <p className="font-medium">{card.playRating}</p>
                    <p className="text-xs text-slate-500">{card.status}</p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="font-semibold">
                      {formatCurrency(card.value * card.quantity)}
                    </p>
                    <p className="text-xs text-slate-500">{card.trend}</p>
                  </div>
                </div>
              ))}

              {filteredCards.length === 0 && (
                <div className="px-4 py-12 text-center text-slate-500">
                  Keine Karten gefunden.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}