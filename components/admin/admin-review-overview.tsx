"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  PauseCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  XCircle,
} from "lucide-react";

import { updateListingStatusAction } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

type AdminReviewOverviewProps = {
  listings: AdminListing[];
};

const statusFilters = ["Alle", "REVIEW", "ACTIVE", "PAUSED", "REJECTED", "DRAFT", "SOLD"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatListingType(type: string) {
  const map: Record<string, string> = {
    SINGLE_CARD: "Einzelkarte",
    SEALED_PRODUCT: "Sealed",
    DECK: "Deck",
    BINDER: "Binder",
    COLLECTION: "Sammlung",
  };

  return map[type] ?? type;
}

function getStatusBadgeClass(status: string) {
  if (status === "ACTIVE") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "REVIEW") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "REJECTED") return "border-red-200 bg-red-50 text-red-700";
  if (status === "PAUSED") return "border-slate-200 bg-slate-100 text-slate-700";
  if (status === "SOLD") return "border-blue-200 bg-blue-50 text-blue-700";

  return "border-slate-200 bg-white text-slate-700";
}

function getRiskLevel(listing: AdminListing) {
  if (listing.riskLevel === "HIGH") return "High";
  if (listing.riskLevel === "MEDIUM") return "Medium";
  return "Low";
}

function getRiskBadgeClass(risk: string) {
  if (risk === "High") return "border-red-200 bg-red-50 text-red-700";
  if (risk === "Medium") return "border-amber-200 bg-amber-50 text-amber-700";

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function AdminReviewOverview({ listings }: AdminReviewOverviewProps) {
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Alle");

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesStatus =
        selectedStatus === "Alle" || listing.status === selectedStatus;

      const matchesQuery =
        listing.title.toLowerCase().includes(query.toLowerCase()) ||
        listing.description.toLowerCase().includes(query.toLowerCase()) ||
        listing.seller.toLowerCase().includes(query.toLowerCase()) ||
        listing.listingType.toLowerCase().includes(query.toLowerCase());

      return matchesStatus && matchesQuery;
    });
  }, [listings, query, selectedStatus]);

  const reviewCount = listings.filter((listing) => listing.status === "REVIEW").length;
  const activeCount = listings.filter((listing) => listing.status === "ACTIVE").length;
  const rejectedCount = listings.filter((listing) => listing.status === "REJECTED").length;
  const highRiskCount = listings.filter((listing) => getRiskLevel(listing) === "High").length;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Badge className="mb-4 rounded-full px-4 py-1">
            Admin Review Queue v0.1
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Moderation & Trust Review
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Prüfe Listings, erkenne Risiko-Signale und ändere den Status von Angeboten.
            Das ist die erste Basis für Anti-Scam, KYC-Kontrolle und Moderator-Workflows.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Trust Rules
          </Button>

          <Button>
            <Eye className="mr-2 h-4 w-4" />
            Review starten
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">In Review</p>
                <p className="mt-2 text-3xl font-semibold">{reviewCount}</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <Clock className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Listings mit manuellem Prüfbedarf
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Aktiv</p>
                <p className="mt-2 text-3xl font-semibold">{activeCount}</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Sichtbar im Marketplace
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Abgelehnt</p>
                <p className="mt-2 text-3xl font-semibold">{rejectedCount}</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                <XCircle className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Nicht im Marketplace sichtbar
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-slate-950 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">High Risk</p>
                <p className="mt-2 text-3xl font-semibold">{highRiskCount}</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              Basierend auf KYC, Reputation und Preis
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-semibold">Listing Queue</h2>
              <p className="mt-1 text-sm text-slate-500">
                Suche nach Listing, Verkäufer oder Verkaufstyp.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Queue durchsuchen..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {statusFilters.map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(status)}
                className="rounded-full"
              >
                {status}
              </Button>
            ))}
          </div>

          <div className="mt-6 grid gap-5">
            {filteredListings.map((listing) => {
              const risk = getRiskLevel(listing);

              return (
                <Card key={listing.id} className="rounded-3xl border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{listing.title}</h3>

                          <Badge
                            variant="outline"
                            className={getStatusBadgeClass(listing.status)}
                          >
                            {listing.status}
                          </Badge>

<Badge
  variant="outline"
  className={getRiskBadgeClass(risk)}
>
  Risk: {risk} · {listing.riskScore}/100
</Badge>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {listing.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {formatListingType(listing.listingType)}
                          </Badge>

                          <Badge variant="outline">
                            {formatCurrency(listing.price)}
                          </Badge>

                          <Badge variant="outline">
                            {listing.itemCount} Item(s)
                          </Badge>

                          {listing.binderInfo && (
                            <Badge variant="outline">{listing.binderInfo}</Badge>
                          )}
                        </div>
{listing.riskReasons.length > 0 && (
  <div className="mt-5 rounded-2xl border bg-white p-4">
    <p className="text-sm font-medium">Risk Reasons</p>

    <div className="mt-3 flex flex-wrap gap-2">
      {listing.riskReasons.map((reason) => (
        <Badge key={reason} variant="outline">
          {reason}
        </Badge>
      ))}
    </div>
  </div>
)}
                        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                            {listing.sellerRole === "TRUSTED_MEMBER" ? (
                              <Crown className="h-5 w-5" />
                            ) : (
                              <ShieldCheck className="h-5 w-5" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium">{listing.seller}</p>
                            <p className="text-sm text-slate-500">
                              {listing.sellerRole} · KYC {listing.kycStatus} · Reputation{" "}
                              {listing.reputationScore}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 lg:w-72 lg:grid-cols-1">
                        <form action={updateListingStatusAction}>
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input type="hidden" name="status" value="ACTIVE" />
                          <Button className="w-full" type="submit">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Freigeben
                          </Button>
                        </form>

                        <form action={updateListingStatusAction}>
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input type="hidden" name="status" value="REVIEW" />
                          <Button className="w-full" variant="outline" type="submit">
                            <Clock className="mr-2 h-4 w-4" />
                            In Review
                          </Button>
                        </form>

                        <form action={updateListingStatusAction}>
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input type="hidden" name="status" value="PAUSED" />
                          <Button className="w-full" variant="outline" type="submit">
                            <PauseCircle className="mr-2 h-4 w-4" />
                            Pausieren
                          </Button>
                        </form>

                        <form action={updateListingStatusAction}>
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <Button className="w-full" variant="destructive" type="submit">
                            <XCircle className="mr-2 h-4 w-4" />
                            Ablehnen
                          </Button>
                        </form>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredListings.length === 0 && (
              <div className="rounded-3xl border bg-white px-6 py-16 text-center text-slate-500">
                Keine Listings gefunden.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8 overflow-hidden rounded-3xl bg-slate-950 text-white">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_0.8fr] md:items-center">
          <div>
            <Badge variant="secondary" className="mb-4 rounded-full">
              Trust System Preview
            </Badge>

            <h2 className="text-3xl font-semibold">
              Später entscheidet der Risk Score über den Review-Flow.
            </h2>

            <p className="mt-3 max-w-2xl text-slate-300">
              Basic User, nicht verifizierte Verkäufer, teure Karten, Binder-Sales
              und auffällige Beschreibungen können automatisch in die manuelle
              Prüfung geschoben werden.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["KYC", "Reputation", "Listing Value", "AI Flags"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/10 p-4">
                <ShoppingBag className="mb-3 h-5 w-5" />
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}