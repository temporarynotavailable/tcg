"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Database,
  FileQuestion,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { updateCardModerationStatusAction } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CardProposal = {
  id: string;
  name: string;
  game: string;
  set: string;
  cardNumber: string;
  rarity: string;
  moderationStatus: string;
  createdBy: string;
  variants: string;
  notes: string;
};

type CardProposalReviewProps = {
  cards: CardProposal[];
};

function getStatusBadgeClass(status: string) {
  if (status === "APPROVED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "REJECTED") return "border-red-200 bg-red-50 text-red-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function CardProposalReview({ cards }: CardProposalReviewProps) {
  const [query, setQuery] = useState("");

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      return (
        card.name.toLowerCase().includes(query.toLowerCase()) ||
        card.game.toLowerCase().includes(query.toLowerCase()) ||
        card.set.toLowerCase().includes(query.toLowerCase()) ||
        card.createdBy.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [cards, query]);

  const pendingCount = cards.filter((card) => card.moderationStatus === "PENDING").length;
  const approvedCount = cards.filter((card) => card.moderationStatus === "APPROVED").length;
  const rejectedCount = cards.filter((card) => card.moderationStatus === "REJECTED").length;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Badge className="mb-4 rounded-full px-4 py-1">
            Card Database Review v0.1
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Karten-Vorschläge
          </h2>

          <p className="mt-3 max-w-2xl text-slate-600">
            Community-Vorschläge für neue Karten prüfen, freigeben oder ablehnen.
            Freigegebene Karten werden später vollständig im Marktplatz nutzbar.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">
            <Database className="mr-2 h-4 w-4" />
            Card DB Rules
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-semibold">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="mt-2 text-3xl font-semibold">{approvedCount}</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-slate-950 text-white">
          <CardContent className="p-6">
            <p className="text-sm text-slate-400">Rejected</p>
            <p className="mt-2 text-3xl font-semibold">{rejectedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-xl font-semibold">Vorschlags-Queue</h3>
              <p className="mt-1 text-sm text-slate-500">
                Suche nach Karte, TCG, Set oder Ersteller.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Kartenvorschläge durchsuchen..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            {filteredCards.map((card) => (
              <Card key={card.id} className="rounded-3xl border-slate-200">
                <CardContent className="p-5">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{card.name}</h3>

                        <Badge
                          variant="outline"
                          className={getStatusBadgeClass(card.moderationStatus)}
                        >
                          {card.moderationStatus}
                        </Badge>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {card.game} · {card.set} · {card.cardNumber || "ohne Nummer"} ·{" "}
                        {card.rarity || "ohne Seltenheit"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="outline">{card.variants}</Badge>
                        <Badge variant="outline">Created by {card.createdBy}</Badge>
                      </div>

                      {card.notes && (
                        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                          {card.notes}
                        </div>
                      )}

                      <div className="mt-5 flex items-center gap-3 text-sm text-slate-500">
                        <ShieldCheck className="h-4 w-4" />
                        Moderation verhindert fehlerhafte oder doppelte Karten.
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:w-64 lg:grid-cols-1">
                      <form action={updateCardModerationStatusAction}>
                        <input type="hidden" name="cardId" value={card.id} />
                        <input type="hidden" name="moderationStatus" value="APPROVED" />
                        <Button className="w-full" type="submit">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Freigeben
                        </Button>
                      </form>

                      <form action={updateCardModerationStatusAction}>
                        <input type="hidden" name="cardId" value={card.id} />
                        <input type="hidden" name="moderationStatus" value="PENDING" />
                        <Button className="w-full" variant="outline" type="submit">
                          <FileQuestion className="mr-2 h-4 w-4" />
                          Pending
                        </Button>
                      </form>

                      <form action={updateCardModerationStatusAction}>
                        <input type="hidden" name="cardId" value={card.id} />
                        <input type="hidden" name="moderationStatus" value="REJECTED" />
                        <Button className="w-full" variant="destructive" type="submit">
                          <XCircle className="mr-2 h-4 w-4" />
                          Ablehnen
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredCards.length === 0 && (
              <div className="rounded-3xl border bg-white px-6 py-16 text-center text-slate-500">
                Keine Kartenvorschläge gefunden.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}