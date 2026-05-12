import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Trading",
    description:
      "KYC, Reputation und Trust-Level für weniger Scam, Fake-Angebote und riskante Trades.",
  },
  {
    icon: Bot,
    title: "AI Card Recognition",
    description:
      "Karten, Binderseiten und später ganze Sammlungen schneller per Bild erfassen.",
  },
  {
    icon: BarChart3,
    title: "Price Intelligence",
    description:
      "Preischarts aus internen Verkäufen, eBay Last Solds, TCGplayer, SNKRDUNK und weiteren Quellen.",
  },
  {
    icon: Trophy,
    title: "Play Rating",
    description:
      "Bewerte Karten nicht nur nach Preis, sondern auch nach aktueller Turnier- und Meta-Relevanz.",
  },
  {
    icon: Boxes,
    title: "Sell Cards, Decks & Binders",
    description:
      "Verkaufe Einzelkarten, Sealed Produkte, Turnierdecks, Binder oder komplette Sammlungen.",
  },
  {
    icon: Sparkles,
    title: "Multi-TCG Platform",
    description:
      "Vorbereitet für Pokémon, One Piece, Magic, Disney Lorcana und Yu-Gi-Oh!.",
  },
];

const games = ["Pokémon", "One Piece", "Magic", "Lorcana", "Yu-Gi-Oh!"];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
        <div>
          <Badge className="mb-6 rounded-full px-4 py-1">
            Modern TCG marketplace powered by trust & AI
          </Badge>

          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
            Die nächste Generation für TCG-Handel.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Kaufe, verkaufe, verwalte und analysiere TCG-Karten auf einer modernen Plattform
            mit KYC, AI-Erkennung, Preisintelligenz, Deck Builder und exklusiven Binder-Sales.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Dashboard ansehen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="/pokemon/marketplace">Marketplace entdecken</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {games.map((game) => (
              <span
                key={game}
                className="rounded-full border bg-white px-4 py-2 text-sm text-slate-600"
              >
                {game}
              </span>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-xl">
          <CardContent className="p-0">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Portfolio Value</p>
                  <p className="mt-1 text-4xl font-semibold">€ 12.482,40</p>
                </div>
                <Badge variant="secondary">+18.4%</Badge>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-400">Cards</p>
                  <p className="mt-1 text-2xl font-semibold">1.284</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-400">Decks</p>
                  <p className="mt-1 text-2xl font-semibold">7</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-400">Trust</p>
                  <p className="mt-1 text-2xl font-semibold">98</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-white p-6">
              {[
                ["Charizard ex", "Pokémon", "Play Rating 8.7", "€ 42,90"],
                ["Monkey.D.Luffy", "One Piece", "Meta Rising", "€ 18,40"],
                ["The One Ring", "Magic", "High Demand", "€ 69,90"],
              ].map(([name, game, tag, price]) => (
                <div key={name} className="flex items-center justify-between rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-sm text-slate-500">
                      {game} · {tag}
                    </p>
                  </div>

                  <p className="font-semibold">{price}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-slate-500">
            Plattformmodule
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Mehr als nur ein Marktplatz.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="rounded-3xl">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-lg font-semibold">{feature.title}</h3>

                  <p className="mt-2 leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}