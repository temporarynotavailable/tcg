import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Database,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { addCollectionItemAction } from "@/app/collection/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CardOption = {
  id: string;
  label: string;
  game: string;
};

type AddCardFormProps = {
  cardOptions: CardOption[];
};

const conditions = [
  { value: "MINT", label: "Mint" },
  { value: "NEAR_MINT", label: "Near Mint" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "LIGHT_PLAYED", label: "Light Played" },
  { value: "PLAYED", label: "Played" },
  { value: "POOR", label: "Poor" },
];

export function AddCardForm({ cardOptions }: AddCardFormProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <Button variant="outline" asChild>
          <Link href="/collection">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Sammlung
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="overflow-hidden rounded-3xl">
          <CardContent className="p-0">
            <div className="bg-slate-950 p-6 text-white">
              <Badge variant="secondary" className="mb-4 rounded-full">
                Collection Add v0.1
              </Badge>

              <h1 className="text-4xl font-semibold tracking-tight">
                Karte hinzufügen
              </h1>

              <p className="mt-3 max-w-2xl text-slate-300">
                Wähle eine vorhandene Kartenvariante aus der Datenbank und füge sie
                deiner Sammlung hinzu. Wenn die Karte bereits mit gleichem Zustand
                existiert, erhöhen wir automatisch die Menge.
              </p>
            </div>

            <form action={addCollectionItemAction} className="space-y-5 bg-white p-6">
              <div>
                <label className="text-sm font-medium">Karte aus Datenbank</label>
                <select
                  name="cardVariantId"
                  required
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue={cardOptions[0]?.id ?? ""}
                >
                  {cardOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {cardOptions.length === 0 && (
                  <p className="mt-2 text-sm text-amber-600">
                    Keine freigegebenen Karten gefunden. Bitte erst Karten anlegen oder Vorschläge im Admin-Bereich freigeben.
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Zustand</label>
                  <select
                    name="condition"
                    className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue="NEAR_MINT"
                  >
                    {conditions.map((condition) => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Menge</label>
                  <Input
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Einkaufspreis / Wert</label>
                <Input
                  name="acquiredPrice"
                  placeholder="z.B. 42,90"
                  className="mt-2"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Optional. Später wird dieser Wert durch echte PriceSnapshots ergänzt.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Notizen</label>
                <textarea
                  name="notes"
                  className="mt-2 min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="z.B. aus Trade erhalten, leichte Kratzer auf Rückseite, Geschenk, Turnierpreis..."
                />
              </div>

              <Button className="w-full" size="lg" type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Zur Sammlung hinzufügen
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Database className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold">Datenbank verbunden</h2>

              <p className="mt-2 leading-7 text-slate-600">
                Diese Seite nutzt echte `CardVariant`-Einträge aus Prisma. Neue
                Collection Items werden direkt in der SQLite-Datenbank gespeichert.
              </p>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Verfügbare Varianten:{" "}
                <span className="font-medium text-slate-950">
                  {cardOptions.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-slate-950 text-white">
            <CardContent className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Bot className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold">AI Scan kommt später</h2>

              <p className="mt-2 leading-7 text-slate-300">
                Dieser manuelle Flow ist die Basis. Später kann die AI eine Karte
                erkennen und dieses Formular automatisch vorausfüllen.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold">Trust-ready</h2>

              <p className="mt-2 leading-7 text-slate-600">
                Später können nur Trusted Member neue Karten direkt anlegen.
                Basic User würden neue Karten zunächst nur vorschlagen.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  "Bestehende Karte hinzufügen",
                  "Menge automatisch erhöhen",
                  "Zustand getrennt speichern",
                  "Dashboard & Decks aktualisieren",
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
                <Sparkles className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold">Nächster Ausbau</h2>

              <p className="mt-2 leading-7 text-slate-600">
                Als nächstes können wir einen zweiten Tab bauen: „Neue Karte
                vorschlagen“. Das passt perfekt zu deinem Trusted-Member-System.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}