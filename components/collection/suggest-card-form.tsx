import Link from "next/link";
import {
  ArrowLeft,
  FilePlus2,
  Info,
  Send,
  Sparkles,
} from "lucide-react";

import { suggestCardAction } from "@/app/collection/suggest/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SuggestCardFormProps = {
  selectedGame: {
    id: string;
    name: string;
    slug: string;
  };
  basePath?: string;
};

export function SuggestCardForm({
  selectedGame,
  basePath = "/pokemon/collection",
}: SuggestCardFormProps) {
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
              Card Suggestion · {selectedGame.name}
            </Badge>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Neue Karte vorschlagen
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Schlage eine neue Karte für{" "}
              <span className="font-medium text-slate-950">
                {selectedGame.name}
              </span>{" "}
              vor. Der Vorschlag landet zuerst in der Admin-Prüfung und kann
              danach für Collection, Marketplace und Decks verwendet werden.
            </p>

            <form action={suggestCardAction} className="mt-8 space-y-6">
              <input type="hidden" name="gameId" value={selectedGame.id} />

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Kartenname</label>
                  <input
                    name="cardName"
                    required
                    placeholder="z.B. Monkey.D.Luffy"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Kartennummer</label>
                  <input
                    name="cardNumber"
                    placeholder="z.B. OP01-003"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Set Name</label>
                  <input
                    name="setName"
                    placeholder="z.B. Romance Dawn"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Seltenheit</label>
                  <input
                    name="rarity"
                    placeholder="z.B. SR, SEC, Rare, Promo"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Sprache</label>
                  <select
                    name="language"
                    defaultValue="DE"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="DE">Deutsch</option>
                    <option value="EN">Englisch</option>
                    <option value="JP">Japanisch</option>
                    <option value="FR">Französisch</option>
                    <option value="IT">Italienisch</option>
                    <option value="ES">Spanisch</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Finish</label>
                  <select
                    name="finish"
                    defaultValue="NORMAL"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="FOIL">Foil</option>
                    <option value="HOLO">Holo</option>
                    <option value="REVERSE_HOLO">Reverse Holo</option>
                    <option value="ALT_ART">Alt Art</option>
                    <option value="SECRET">Secret</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Bild-URL optional</label>
                <input
                  name="imageUrl"
                  placeholder="https://..."
                  className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Zusätzliche Hinweise
                </label>
                <textarea
                  name="notes"
                  placeholder="z.B. Quelle, besondere Variante, Korrekturhinweise, Link zur offiziellen Karte..."
                  className="mt-2 min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="flex flex-col gap-3 rounded-3xl bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">Vorschlag einreichen</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Die Karte wird als PENDING gespeichert und später im Admin
                    Center geprüft.
                  </p>
                </div>

                <Button type="submit">
                  <Send className="mr-2 h-4 w-4" />
                  Vorschlag senden
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl bg-slate-950 text-white">
            <CardContent className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="h-6 w-6" />
              </div>

              <h2 className="text-2xl font-semibold">
                Warum Vorschläge geprüft werden
              </h2>

              <p className="mt-3 leading-7 text-slate-300">
                Neue Karten sollten nicht ungeprüft in die Hauptdatenbank
                gelangen. Erst nach Admin-Freigabe können sie in Collection,
                Marketplace und Deck Builder genutzt werden.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Schützt vor Fake Cards",
                  "Verhindert doppelte Einträge",
                  "Hält Set- und Nummerndaten sauber",
                  "Bereitet spätere AI-Erkennung vor",
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
                <Info className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold">Aktiver Bereich</h2>

              <p className="mt-2 text-slate-600">
                Dieser Vorschlag wird direkt für folgendes TCG erstellt:
              </p>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">TCG</p>
                <p className="mt-1 text-lg font-semibold">
                  {selectedGame.name}
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <Button variant="outline" asChild>
                  <Link href={`${basePath}/add`}>
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Karte hinzufügen
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