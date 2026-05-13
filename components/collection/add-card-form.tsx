import Link from "next/link";
import {
  ArrowLeft,
  BadgeEuro,
  Boxes,
  CheckCircle2,
  Plus,
  Sparkles,
} from "lucide-react";

import { addCollectionItemAction } from "@/app/collection/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CardOption = {
  id: string;
  label: string;
};

type AddCardFormProps = {
  cardOptions: CardOption[];
  basePath?: string;
  selectedGame?: {
    id: string;
    name: string;
    slug: string;
  };
};

export function AddCardForm({
  cardOptions,
  basePath = "/pokemon/collection",
  selectedGame,
}: AddCardFormProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <Button variant="outline" asChild>
          <Link href={basePath}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Sammlung
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <Card className="rounded-3xl">
          <CardContent className="p-6 md:p-8">
            <Badge className="mb-4 rounded-full px-4 py-1">
              Collection Add · {selectedGame?.name ?? "TCG"}
            </Badge>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Karte hinzufügen
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Füge deiner Sammlung eine bereits freigegebene Karte hinzu
              {selectedGame ? (
                <>
                  {" "}
                  aus dem Bereich{" "}
                  <span className="font-medium text-slate-950">
                    {selectedGame.name}
                  </span>
                  .
                </>
              ) : (
                "."
              )}
            </p>

            <form action={addCollectionItemAction} className="mt-8 space-y-6">
              <div>
                <label className="text-sm font-medium">Karte</label>

                {cardOptions.length > 0 ? (
                  <select
                    name="cardVariantId"
                    required
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {cardOptions.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-2 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-600">
                    Für dieses TCG gibt es aktuell keine freigegebenen
                    Kartenvarianten. Schlage zuerst eine Karte vor oder gib eine
                    Karte im Admin Center frei.
                  </div>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Zustand</label>
                  <select
                    name="condition"
                    defaultValue="NEAR_MINT"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="MINT">Mint</option>
                    <option value="NEAR_MINT">Near Mint</option>
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="LIGHT_PLAYED">Light Played</option>
                    <option value="PLAYED">Played</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Menge</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue="1"
                    required
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Einkaufspreis optional
                  </label>
                  <input
                    name="acquiredPrice"
                    type="text"
                    placeholder="z.B. 12,50"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Verkaufbar?</label>
                  <select
                    name="isForSale"
                    defaultValue="false"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="false">Nein</option>
                    <option value="true">Ja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notizen optional</label>
                <textarea
                  name="notes"
                  placeholder="z.B. aus Booster gezogen, gekauft auf Cardmarket, besondere Erinnerung..."
                  className="mt-2 min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="flex flex-col gap-3 rounded-3xl bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">In Sammlung speichern</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Die Karte wird deinem Demo-User CardVault zugeordnet.
                  </p>
                </div>

                <Button type="submit" disabled={cardOptions.length === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  Karte hinzufügen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl bg-slate-950 text-white">
            <CardContent className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Boxes className="h-6 w-6" />
              </div>

              <h2 className="text-2xl font-semibold">
                Saubere TCG-Trennung
              </h2>

              <p className="mt-3 leading-7 text-slate-300">
                Diese Add-Seite zeigt nur Kartenvarianten des aktiven TCGs. So
                landen Pokémon-, One-Piece-, Magic-, Lorcana- und Yu-Gi-Oh!-Daten
                nicht versehentlich im selben Pool.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Filter nach gameId",
                  "Nur APPROVED Karten",
                  "Automatische Rückleitung",
                  "Bereit für AI-Erkennung",
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
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Sparkles className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold">Aktiver Bereich</h2>

              <p className="mt-2 text-slate-600">
                Du fügst Karten in diese Sammlung ein:
              </p>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">TCG</p>
                <p className="mt-1 text-lg font-semibold">
                  {selectedGame?.name ?? "Pokémon"}
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">gameId wird automatisch gesetzt</span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <BadgeEuro className="h-4 w-4 text-slate-600" />
                  <span className="text-sm">
                    Einkaufspreis kann später in Portfolio Value einfließen
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <Button variant="outline" asChild>
                  <Link href={`${basePath}/suggest`}>
                    Karte vorschlagen
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}