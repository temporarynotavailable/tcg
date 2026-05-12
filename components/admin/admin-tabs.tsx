"use client";

import { Database, ShieldCheck } from "lucide-react";

import { AdminReviewOverview } from "@/components/admin/admin-review-overview";
import { CardProposalReview } from "@/components/admin/card-proposal-review";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AdminListing = {
  id: string;
  title: string;
  description: string;
  listingType: string;
  status: string;
  price: number;
  seller: string;
  sellerRole: string;
  kycStatus: string;
  reputationScore: number;
  itemCount: number;
  binderInfo: string | null;
  createdAt: string;
};

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

type AdminTabsProps = {
  listings: AdminListing[];
  cards: CardProposal[];
};

export function AdminTabs({ listings, cards }: AdminTabsProps) {
  const pendingCards = cards.filter(
    (card) => card.moderationStatus === "PENDING",
  ).length;

  const reviewListings = listings.filter(
    (listing) => listing.status === "REVIEW",
  ).length;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Admin Center
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Zentrale Review-Oberfläche für Karten-Vorschläge, Listing-Prüfung,
          Trust-Workflows und spätere Moderator-Aufgaben.
        </p>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-1 rounded-3xl bg-white p-2 shadow-sm md:grid-cols-2">
          <TabsTrigger
            value="cards"
            className="flex items-center gap-2 rounded-2xl px-5 py-4 data-[state=active]:bg-slate-950 data-[state=active]:text-white"
          >
            <Database className="h-4 w-4" />
            Kartenprüfung
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 data-[state=active]:bg-white/10">
              {pendingCards} pending
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="listings"
            className="flex items-center gap-2 rounded-2xl px-5 py-4 data-[state=active]:bg-slate-950 data-[state=active]:text-white"
          >
            <ShieldCheck className="h-4 w-4" />
            Listing-Prüfung
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 data-[state=active]:bg-white/10">
              {reviewListings} review
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-6">
          <CardProposalReview cards={cards} />
        </TabsContent>

        <TabsContent value="listings" className="mt-6">
          <AdminReviewOverview listings={listings} />
        </TabsContent>
      </Tabs>
    </section>
  );
}