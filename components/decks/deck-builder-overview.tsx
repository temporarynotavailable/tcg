"use client";

import { CardImagePreview } from "@/components/cards/card-image-preview";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleAlert,
  CopyPlus,
  Crown,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type DeckCard = {
  id: string;
  name: string;
  imageUrl: string | null;
  game: string;
  type: string;
  quantity: number;
  owned: number;
  price: number;
  playRating: number;
  role: string;
};

type DeckBuilderOverviewProps = {
  deck: {
    name: string;
    game: string;
    format: string;
    playRating: number;
  };
  cards: DeckCard[];
};

const suggestedCards = [
  {
    name: "Raikou V",
    reason: "Starke Synergie mit Lightning Engine",
    price: "€ 2,90",
  },
  {
    name: "Forest Seal Stone",
    reason: "Erhöht Konsistenz im Midgame",
    price: "€ 6,40",
  },
  {
    name: "Iono",
    reason: "Meta-relevante Handkontrolle",
    price: "€ 4,20",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function DeckBuilderOverview({
  deck,
  cards,
}: DeckBuilderOverviewProps) {
  const [query, setQuery] = useState("");

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      return (
        card.name.toLowerCase().includes(query.toLowerCase()) ||
        card.type.toLowerCase().includes(query.toLowerCase()) ||
        card.role.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [cards, query]);

  const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0);
  const ownedCards = cards.reduce(
    (sum, card) => sum + Math.min(card.owned, card.quantity),
    0,
  );
  const missingCards = cards.reduce(
    (sum, card) => sum + Math.max(card.quantity - card.owned, 0),
    0,
  );
  const missingValue = cards.reduce(
    (sum, card) => sum + Math.max(card.quantity - card.owned, 0) * card.price,
    0,
  );
  const deckValue = cards.reduce(
    (sum, card) => sum + card.quantity * card.price,
    0,
  );

  const averagePlayRating =
    cards.length === 0
      ? deck.playRating
      : cards.reduce((sum, card) => sum + card.playRating, 0) / cards.length;

  const completionRate =
    totalCards === 0 ? 0 : Math.round((ownedCards / totalCards) * 100);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Badge className="mb-4 rounded-full px-4 py-1">
            Deck Builder v0.2 · Database Connected
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {deck.name}
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Dieses Deck wird jetzt aus Prisma geladen. Deckliste, Besitzstatus,
            Preise und Play Ratings kommen aus echten Datenbanktabellen.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline">
            <Bot className="mr-2 h-4 w-4" />
            Deck importieren
          </Button>

          <Button>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Deck verkaufen
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Deck Completion</p>
                <p className="mt-2 text-3xl font-semibold">{completionRate}%</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-slate-950"
                style={{ width: `${completionRate}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {ownedCards}/{totalCards} Karten vorhanden
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Fehlende Karten</p>
                <p className="mt-2 text-3xl font-semibold">{missingCards}</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <CircleAlert className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Geschätzt {formatCurrency(missingValue)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Deck Value</p>
                <p className="mt-2 text-3xl font-semibold">
                  {formatCurrency(deckValue)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Aus PriceSnapshots berechnet
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-slate-950 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Play Rating</p>
                <p className="mt-2 text-3xl font-semibold">
                  {averagePlayRating.toFixed(1)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Trophy className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              {deck.game} · {deck.format}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-xl font-semibold">Deckliste</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Suche nach Karten, Typ oder Rolle im Deck.
                </p>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Deck durchsuchen..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
              <div className="hidden grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.8fr] border-b bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 lg:grid">
                <div>Karte</div>
                <div>Typ</div>
                <div>Menge</div>
                <div>Besitz</div>
                <div className="text-right">Wert</div>
              </div>

              <div className="divide-y">
                {filteredCards.map((card) => {
                  const missing = Math.max(card.quantity - card.owned, 0);

                  return (
                    <div
                      key={card.id}
                      className="grid gap-4 px-4 py-4 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.8fr] lg:items-center"
                    >
<div className="flex items-center gap-4">
<CardImagePreview
  src={card.imageUrl}
  alt={card.name}
  className="h-20 w-14 rounded-xl"
>
  <Trophy className="h-5 w-5 text-slate-400" />
</CardImagePreview>

  <div>
    <div className="flex items-center gap-2">
      <p className="font-medium">{card.name}</p>

      {card.playRating >= 8.5 && (
        <Badge className="rounded-full">Meta</Badge>
      )}
    </div>

    <p className="text-sm text-slate-500">
      {card.role} · Rating {card.playRating.toFixed(1)}
    </p>
  </div>
</div>

                      <div>
                        <Badge variant="outline">{card.type}</Badge>
                      </div>

                      <div className="text-sm text-slate-600">
                        {card.quantity}x
                      </div>

                      <div>
                        {missing === 0 ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            vollständig
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-amber-200 bg-amber-50 text-amber-700"
                          >
                            fehlt {missing}x
                          </Badge>
                        )}
                      </div>

                      <div className="text-left lg:text-right">
                        <p className="font-semibold">
                          {formatCurrency(card.quantity * card.price)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(card.price)} / Karte
                        </p>
                      </div>
                    </div>
                  );
                })}

                {filteredCards.length === 0 && (
                  <div className="px-4 py-12 text-center text-slate-500">
                    Keine Karten gefunden.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden rounded-3xl bg-slate-950 text-white">
            <CardContent className="p-6">
              <Badge variant="secondary" className="mb-5 rounded-full">
                Tournament Ready Check
              </Badge>

              <h2 className="text-2xl font-semibold">
                {completionRate >= 100
                  ? "Vollständig spielbereit."
                  : "Fast vollständig spielbereit."}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Dieses Deck ist zu {completionRate}% aus deiner Sammlung baubar.
                Fehlende Karten können später automatisch in eine Wishlist oder
                einen Kaufvorschlag übertragen werden.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                  <span className="text-sm">Format</span>
                  <span className="font-medium">{deck.format}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                  <span className="text-sm">Deck Type</span>
                  <span className="font-medium">Lightning Aggro</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                  <span className="text-sm">Sell Mode</span>
                  <span className="font-medium">Complete Deck</span>
                </div>
              </div>

              <Button variant="secondary" className="mt-6 w-full">
                Fehlende Karten suchen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Empfohlene Karten</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Später auf Basis von Meta-Daten und Sammlung.
                  </p>
                </div>

                <Sparkles className="h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-5 space-y-3">
                {suggestedCards.map((card) => (
                  <div
                    key={card.name}
                    className="flex items-center justify-between rounded-2xl border bg-white p-4"
                  >
                    <div>
                      <p className="font-medium">{card.name}</p>
                      <p className="text-sm text-slate-500">{card.reason}</p>
                    </div>

                    <p className="font-semibold">{card.price}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Deck Sale Trust</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Beim Verkauf eines kompletten Decks werden später alle Karten,
                    Zustände und Sprachen einzeln bestätigt. Das schützt Käufer und
                    Verkäufer.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8 rounded-3xl">
        <CardContent className="grid gap-5 p-6 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-5">
            <CopyPlus className="mb-4 h-6 w-6" />
            <h3 className="font-semibold">Deck importieren</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Später: Decklisten per Text, Bild oder Turnierquelle importieren.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <Crown className="mb-4 h-6 w-6" />
            <h3 className="font-semibold">Meta-Vergleich</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Vergleiche dein Deck später mit erfolgreichen Turnierlisten.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <ShoppingBag className="mb-4 h-6 w-6" />
            <h3 className="font-semibold">Deck verkaufen</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Verkaufe vollständige, geprüfte Decks als Premium-Listings.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}