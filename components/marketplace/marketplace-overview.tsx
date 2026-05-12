"use client";

import Link from "next/link";
import { CardImagePreview } from "@/components/cards/card-image-preview";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  Crown,
  Layers3,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type MarketplaceListing = {
  id: string;
  title: string;
  imageUrl: string | null;
  game: string;
  type: string;
  seller: string;
  trust: string;
  rating: string;
  price: number;
  marketTrend: string;
  meta: string;
  description: string;
  verified: boolean;
};

type MarketplaceOverviewProps = {
  listings: MarketplaceListing[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function getTypeIcon(type: string) {
  if (type === "Einzelkarte") return Sparkles;
  if (type === "Sealed") return PackageCheck;
  if (type === "Deck") return Trophy;
  if (type === "Binder") return Layers3;
  if (type === "Sammlung") return Boxes;

  return Sparkles;
}

function getTrustBadgeClass(trust: string) {
  if (trust === "Trusted Member") return "bg-slate-950 text-white";
  if (trust === "Verified") return "bg-emerald-50 text-emerald-700 border-emerald-200";

  return "bg-amber-50 text-amber-700 border-amber-200";
}

export function MarketplaceOverview({ listings }: MarketplaceOverviewProps) {
  const [query, setQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("Alle");
  const [selectedType, setSelectedType] = useState("Alle");

  const availableGames = useMemo(() => {
    const uniqueGames = Array.from(new Set(listings.map((listing) => listing.game)));
    return ["Alle", ...uniqueGames];
  }, [listings]);

  const availableTypes = useMemo(() => {
    const uniqueTypes = Array.from(new Set(listings.map((listing) => listing.type)));
    return ["Alle", ...uniqueTypes];
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesGame = selectedGame === "Alle" || listing.game === selectedGame;
      const matchesType = selectedType === "Alle" || listing.type === selectedType;

      const matchesQuery =
        listing.title.toLowerCase().includes(query.toLowerCase()) ||
        listing.description.toLowerCase().includes(query.toLowerCase()) ||
        listing.seller.toLowerCase().includes(query.toLowerCase()) ||
        listing.meta.toLowerCase().includes(query.toLowerCase());

      return matchesGame && matchesType && matchesQuery;
    });
  }, [listings, query, selectedGame, selectedType]);

  const totalVolume = listings.reduce((sum, listing) => sum + listing.price, 0);
  const trustedListings = listings.filter((listing) => listing.verified).length;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Badge className="mb-4 rounded-full px-4 py-1">
            Marketplace v0.2 · Database Connected
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Marketplace
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Listings werden jetzt aus deiner lokalen Prisma-Datenbank geladen.
            Verkäuferdaten, Trust-Level, Binder-Informationen und Kartenbezüge sind bereits verbunden.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Preisradar
          </Button>

          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Listing erstellen
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Aktive Listings</p>
                <p className="mt-2 text-3xl font-semibold">{listings.length}</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <Boxes className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Aus Listing-Tabelle geladen
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Marketplace Value</p>
                <p className="mt-2 text-3xl font-semibold">
                  {formatCurrency(totalVolume)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Summe aller aktiven DB-Listings
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-slate-950 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Verified Listings</p>
                <p className="mt-2 text-3xl font-semibold">
                  {trustedListings}/{listings.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              Aus User KYC-Status berechnet
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-semibold">Listings entdecken</h2>
              <p className="mt-1 text-sm text-slate-500">
                Suche nach Listing, Verkäufer, Beschreibung oder AI-/Play-Rating-Meta.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Marketplace durchsuchen..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap gap-2">
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

            <div className="flex flex-wrap gap-2">
              {availableTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="rounded-full"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {filteredListings.map((listing) => {
              const Icon = getTypeIcon(listing.type);

              return (
                <Card key={listing.id} className="rounded-3xl border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
<CardImagePreview
  src={listing.imageUrl}
  alt={listing.title}
  className="h-24 w-16 rounded-2xl"
>
  <Icon className="h-6 w-6" />
</CardImagePreview>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{listing.title}</h3>

                            {listing.verified && (
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            )}
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {listing.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {formatCurrency(listing.price)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {listing.marketTrend}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Badge variant="outline">{listing.game}</Badge>
                      <Badge variant="outline">{listing.type}</Badge>
                      <Badge variant="outline">{listing.meta}</Badge>
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                      <div>
                        <p className="text-sm font-medium">{listing.seller}</p>

                        <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                          <Star className="h-3.5 w-3.5 fill-slate-400 text-slate-400" />
                          {listing.rating} Seller Rating
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={getTrustBadgeClass(listing.trust)}
                      >
                        {listing.trust === "Trusted Member" && (
                          <Crown className="mr-1 h-3.5 w-3.5" />
                        )}
                        {listing.trust}
                      </Badge>
                    </div>

                    <div className="mt-5 flex gap-3">
<Button className="flex-1" asChild>
  <Link href={`/marketplace/${listing.id}`}>Details ansehen</Link>
</Button>

<Button variant="outline" className="flex-1">
  Merken
</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredListings.length === 0 && (
              <div className="col-span-full rounded-3xl border bg-white px-6 py-16 text-center text-slate-500">
                Keine Listings gefunden.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}