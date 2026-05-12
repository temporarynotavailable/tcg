"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bot,
  Boxes,
  Camera,
  CheckCircle2,
  CreditCard,
  Layers3,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

import { createListingAction } from "@/app/sell/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CardOption = {
  id: string;
  label: string;
};

type SellOverviewProps = {
  cardOptions: CardOption[];
};

const listingTypes = [
  {
    id: "single-card",
    title: "Einzelkarte",
    subtitle: "Eine bestimmte Karte verkaufen",
    icon: Sparkles,
    description: "Ideal für einzelne Karten mit Zustand, Sprache, Variante und Preis.",
    examples: ["Charizard ex", "The One Ring", "Blue-Eyes White Dragon"],
  },
  {
    id: "sealed",
    title: "Sealed Produkt",
    subtitle: "Booster, Displays, Starter Decks",
    icon: PackageCheck,
    description: "Für original verschlossene Produkte wie Displays, ETBs oder Starter Sets.",
    examples: ["Booster Display", "Elite Trainer Box", "Starter Deck"],
  },
  {
    id: "deck",
    title: "Turnierdeck",
    subtitle: "Komplettes Deck verkaufen",
    icon: Trophy,
    description: "Verkaufe ein vollständiges Deck mit Deckliste, Format und Play Rating.",
    examples: ["60 Karten", "Tournament Ready", "Standard Format"],
  },
  {
    id: "binder",
    title: "Binder",
    subtitle: "Binderseiten fotografieren",
    icon: Layers3,
    description: "Exklusiver Verkaufsflow für ganze Binder mit AI-Erkennung der Seiten.",
    examples: ["9er-Seiten", "AI-Erkennung", "Gesamtwert-Schätzung"],
  },
  {
    id: "collection",
    title: "Sammlung",
    subtitle: "Komplette Collection verkaufen",
    icon: Boxes,
    description: "Für große Sammlungen mit mehreren Karten, Sets, Sprachen und Zuständen.",
    examples: ["Retro Sammlung", "Full Arts", "Bulk + Hits"],
  },
];

const steps = [
  {
    title: "Verkaufstyp wählen",
    description: "Wähle, ob du eine Karte, ein Deck, einen Binder oder eine Sammlung verkaufen willst.",
  },
  {
    title: "Details erfassen",
    description: "Titel, Beschreibung, TCG, Zustand, Sprache, Bilder und Preis festlegen.",
  },
  {
    title: "Trust & Prüfung",
    description: "Je nach Nutzerstatus wird das Listing automatisch oder manuell geprüft.",
  },
  {
    title: "Listing veröffentlichen",
    description: "Nach Prüfung erscheint dein Angebot im Marketplace.",
  },
];

export function SellOverview({ cardOptions }: SellOverviewProps) {
  const [selectedType, setSelectedType] = useState(listingTypes[0]);

  const SelectedIcon = selectedType.icon;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Badge className="mb-4 rounded-full px-4 py-1">
            Sell Flow v0.2 · Database Write
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Was möchtest du verkaufen?
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Erstelle jetzt echte Listings in deiner lokalen Prisma-Datenbank.
            Nach dem Speichern erscheint dein Angebot direkt im Marketplace.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Seller Trust
          </Button>

          <Button form="create-listing-form" type="submit">
            <CreditCard className="mr-2 h-4 w-4" />
            Listing veröffentlichen
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div>
              <h2 className="text-xl font-semibold">Verkaufsart auswählen</h2>
              <p className="mt-1 text-sm text-slate-500">
                Jeder Verkaufstyp bekommt später einen eigenen optimierten Flow.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {listingTypes.map((type) => {
                const Icon = type.icon;
                const isActive = selectedType.id === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`w-full rounded-3xl border p-4 text-left transition ${
                      isActive
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          isActive ? "bg-white/10" : "bg-slate-100"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-semibold">{type.title}</p>
                        <p
                          className={`mt-1 text-sm ${
                            isActive ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {type.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl">
          <CardContent className="p-0">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="secondary" className="mb-4 rounded-full">
                    Ausgewählter Flow
                  </Badge>

                  <h2 className="text-3xl font-semibold">
                    {selectedType.title} verkaufen
                  </h2>

                  <p className="mt-3 max-w-2xl text-slate-300">
                    {selectedType.description}
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <SelectedIcon className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {selectedType.examples.map((example) => (
                  <Badge key={example} variant="secondary" className="rounded-full">
                    {example}
                  </Badge>
                ))}
              </div>
            </div>

            <form
              id="create-listing-form"
              action={createListingAction}
              className="grid gap-6 bg-white p-6 lg:grid-cols-[1fr_0.8fr]"
            >
              <input type="hidden" name="listingType" value={selectedType.id} />

              <div>
                <h3 className="text-lg font-semibold">Listing Details</h3>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Titel</label>
                    <Input
                      name="title"
                      required
                      className="mt-2"
                      placeholder={
                        selectedType.id === "binder"
                          ? "z.B. One Piece Binder mit 216 Karten"
                          : selectedType.id === "deck"
                            ? "z.B. Miraidon Turnierdeck Standard"
                            : "z.B. Charizard ex Near Mint"
                      }
                    />
                  </div>

                  {selectedType.id === "single-card" && (
                    <div>
                      <label className="text-sm font-medium">Karte aus Datenbank</label>
                      <select
                        name="cardVariantId"
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
                          Keine freigegebenen Kartenvarianten gefunden. Bitte erst Karten im Admin-Bereich freigeben.
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Preisvorstellung</label>
                    <Input
                      name="price"
                      required
                      className="mt-2"
                      placeholder="z.B. 89,90"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Beschreibung</label>
                    <textarea
                      name="description"
                      className="mt-2 min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Beschreibe Zustand, Sprache, Besonderheiten, enthaltene Karten oder Fotos..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="rounded-3xl border-dashed">
                  <CardContent className="p-5">
                    <div className="flex h-40 flex-col items-center justify-center rounded-2xl bg-slate-50 text-center">
                      <Camera className="h-8 w-8 text-slate-400" />
                      <p className="mt-3 font-medium">Bilder hochladen</p>
                      <p className="mt-1 max-w-xs text-sm text-slate-500">
                        Uploads kommen später. Aktuell speichern wir nur Listing-Daten.
                      </p>
                    </div>

                    <Button variant="outline" className="mt-4 w-full" type="button">
                      Bilder auswählen
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl bg-slate-50">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white">
                        <Bot className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-medium">AI-Erkennung vorbereitet</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Bei Binder- und Collection-Sales erkennt die AI später
                          Karten automatisch und markiert unsichere Treffer.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl bg-slate-950 text-white">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                        <ShieldCheck className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-medium">Trust Review</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
Das System berechnet jetzt automatisch einen Risk Score.
Je nach Verkäuferstatus, KYC, Preis und Verkaufstyp wird das Listing
direkt aktiv oder landet in der Review Queue.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full" size="lg" type="submit">
                  Listing veröffentlichen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="flex flex-col justify-between gap-4 border-t bg-white p-6 md:flex-row md:items-center">
              <div className="text-sm text-slate-500">
                Nach dem Speichern wirst du direkt zum Marketplace weitergeleitet.
              </div>

              <div className="text-sm font-medium text-slate-700">
                Seller: CardVault · Status: automatisch per Risk Score
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step.title} className="rounded-3xl">
            <CardContent className="p-5">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                <span className="text-sm font-semibold">{index + 1}</span>
              </div>

              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 overflow-hidden rounded-3xl bg-slate-950 text-white">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_0.7fr] md:items-center">
          <div>
            <Badge variant="secondary" className="mb-4 rounded-full">
              Exclusive Feature
            </Badge>

            <h2 className="text-3xl font-semibold">
              Binder Sales werden dein USP.
            </h2>

            <p className="mt-3 max-w-2xl text-slate-300">
              Verkäufer laden später einfach Binderseiten hoch. Die Plattform erkennt
              Karten automatisch, schätzt den Gesamtwert und erzeugt ein hochwertiges
              Collection-Sale-Listing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["Foto Upload", "AI Scan", "Value Estimate", "Review Queue"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/10 p-4">
                <CheckCircle2 className="mb-3 h-5 w-5" />
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}