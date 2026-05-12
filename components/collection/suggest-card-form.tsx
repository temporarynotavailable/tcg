import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  FilePlus2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { suggestCardAction } from "@/app/collection/suggest/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type GameOption = {
  id: string;
  name: string;
};

type SuggestCardFormProps = {
  games: GameOption[];
};

const languages = ["DE", "EN", "JP", "FR", "IT", "ES", "CN", "KR"];

const finishes = [
  "Normal",
  "Holo",
  "Reverse Holo",
  "Foil",
  "Alt Art",
  "Full Art",
  "Secret Rare",
];

export function SuggestCardForm({ games }: SuggestCardFormProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/collection">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Sammlung
          </Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/collection/add">
            <Database className="mr-2 h-4 w-4" />
            Bestehende Karte hinzufügen
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="overflow-hidden rounded-3xl">
          <CardContent className="p-0">
            <div className="bg-slate-950 p-6 text-white">
              <Badge variant="secondary" className="mb-4 rounded-full">
                Card Suggestion v0.1
              </Badge>

              <h1 className="text-4xl font-semibold tracking-tight">
                Neue Karte vorschlagen
              </h1>

              <p className="mt-3 max-w-2xl text-slate-300">
                Wenn eine Karte noch nicht in der Datenbank existiert, kannst du sie
                hier vorschlagen. Der Vorschlag landet in der Admin-Review-Queue.
              </p>
            </div>

            <form action={suggestCardAction} className="space-y-5 bg-white p-6">
              <div>
                <label className="text-sm font-medium">TCG</label>
                <select
                  name="gameId"
                  required
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue={games[0]?.id ?? ""}
                >
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Set-Name</label>
                <Input
                  name="setName"
                  required
                  className="mt-2"
                  placeholder="z.B. Paldean Fates, Romance Dawn, LOB..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Kartenname</label>
                <Input
                  name="cardName"
                  required
                  className="mt-2"
                  placeholder="z.B. Charizard ex"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Kartennummer</label>
                  <Input
                    name="cardNumber"
                    className="mt-2"
                    placeholder="z.B. 054/091"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Seltenheit</label>
                  <Input
                    name="rarity"
                    className="mt-2"
                    placeholder="z.B. Ultra Rare"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Sprache</label>
                  <select
                    name="language"
                    className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue="EN"
                  >
                    {languages.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Finish / Variante</label>
                  <select
                    name="finish"
                    className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue="Normal"
                  >
                    {finishes.map((finish) => (
                      <option key={finish} value={finish}>
                        {finish}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Hinweise für Moderatoren</label>
                <textarea
                  name="notes"
                  className="mt-2 min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="z.B. Quelle, Set-Link, Besonderheit, alternative Schreibweise, Sprache..."
                />
              </div>

              <Button className="w-full" size="lg" type="submit">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Karte zur Prüfung einreichen
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl bg-slate-950 text-white">
            <CardContent className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold">Moderation-first</h2>

              <p className="mt-2 leading-7 text-slate-300">
                Neue Karten werden nicht sofort vollständig freigegeben. Sie bekommen
                zuerst den Status <span className="font-medium">PENDING</span>.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Sparkles className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold">Trusted-Member-ready</h2>

              <p className="mt-2 leading-7 text-slate-600">
                Später können Trusted Member bestimmte Karten direkt anlegen oder
                schneller durch die Review Queue kommen.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  "Community kann fehlende Karten melden",
                  "Moderatoren prüfen Qualität",
                  "Admin kann freigeben oder ablehnen",
                  "AI-Erkennung kann später Vorschläge erzeugen",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Database className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold">Multi-TCG Datenbank</h2>

              <p className="mt-2 leading-7 text-slate-600">
                Vorschläge funktionieren für alle aktiven TCGs in der Datenbank.
              </p>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Aktive TCGs:{" "}
                <span className="font-medium text-slate-950">{games.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}