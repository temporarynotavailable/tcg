import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Boxes,
  CheckCircle2,
  Crown,
  Layers3,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import { CardImagePreview } from "@/components/cards/card-image-preview";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ListingDetailPageProps = {
  params: Promise<{
    listingId: string;
  }>;
};

async function buyListingAction(formData: FormData) {
  "use server";

  const listingId = String(formData.get("listingId") ?? "").trim();

  if (!listingId) {
    throw new Error("Listing ID fehlt.");
  }

  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      seller: true,
      items: {
        include: {
          cardVariant: {
            include: {
              card: {
                include: {
                  game: true,
                  set: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!listing) {
    throw new Error("Listing wurde nicht gefunden.");
  }

  if (listing.status !== "ACTIVE") {
    throw new Error("Dieses Listing ist nicht mehr aktiv.");
  }

  const buyer = await prisma.user.upsert({
    where: {
      email: "buyer@tcgnexus.local",
    },
    update: {},
    create: {
      email: "buyer@tcgnexus.local",
      username: "PlayerOne",
      displayName: "PlayerOne",
      role: "VERIFIED_USER",
      kycStatus: "VERIFIED",
      reputationScore: 72,
      trustLevel: 2,
    },
  });

  if (buyer.id === listing.sellerId) {
    throw new Error("Du kannst dein eigenes Listing nicht kaufen.");
  }

  const existingOrder = await prisma.tradeOrder.findUnique({
    where: {
      listingId: listing.id,
    },
  });

  if (existingOrder) {
    redirect("/orders");
  }

  await prisma.$transaction(async (tx) => {
    await tx.tradeOrder.create({
      data: {
        buyerId: buyer.id,
        sellerId: listing.sellerId,
        listingId: listing.id,
        status: "CREATED",
        total: listing.price,
        currency: listing.currency,
        items: {
          create:
            listing.items.length > 0
              ? listing.items.map((item) => ({
                  listingItemId: item.id,
                  cardVariantId: item.cardVariantId,
                  title: item.cardVariant.card.name,
                  quantity: item.quantity,
                  unitPrice: listing.price / listing.items.length,
                }))
              : [
                  {
                    title: listing.title,
                    quantity: 1,
                    unitPrice: listing.price,
                  },
                ],
        },
      },
    });

    await tx.listing.update({
      where: {
        id: listing.id,
      },
      data: {
        status: "SOLD",
      },
    });
  });

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${listing.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/orders");
  revalidatePath("/admin");

  redirect("/orders");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatListingType(type: string) {
  const map: Record<string, string> = {
    SINGLE_CARD: "Einzelkarte",
    SEALED_PRODUCT: "Sealed Produkt",
    DECK: "Turnierdeck",
    BINDER: "Binder",
    COLLECTION: "Sammlung",
  };

  return map[type] ?? type;
}

function formatCondition(condition: string | null | undefined) {
  if (!condition) return "Unbekannt";

  return condition
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getListingTypeIcon(type: string) {
  if (type === "SINGLE_CARD") return Sparkles;
  if (type === "SEALED_PRODUCT") return PackageCheck;
  if (type === "DECK") return Trophy;
  if (type === "BINDER") return Layers3;
  if (type === "COLLECTION") return Boxes;

  return Sparkles;
}

function getTrustLabel(role: string, kycStatus: string) {
  if (role === "TRUSTED_MEMBER") return "Trusted Member";
  if (kycStatus === "VERIFIED") return "Verified";
  return "Basic";
}

function getSellerRating(reputationScore: number) {
  const rating = Math.min(5, Math.max(3.5, reputationScore / 20));
  return rating.toFixed(1);
}

function getRiskBadgeClass(riskLevel: string) {
  if (riskLevel === "HIGH") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (riskLevel === "MEDIUM") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getRiskReasons(riskReasons: string | null) {
  if (!riskReasons) return [];

  try {
    const parsed = JSON.parse(riskReasons);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getTrendFromMetadata(metadata: string | null) {
  if (!metadata) return "—";

  try {
    const parsed = JSON.parse(metadata);
    return parsed.trend ?? "—";
  } catch {
    return "—";
  }
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { listingId } = await params;

  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      seller: true,
      binderSale: {
        include: {
          images: true,
        },
      },
      items: {
        include: {
          cardVariant: {
            include: {
              priceSnapshots: {
                orderBy: {
                  date: "desc",
                },
                take: 1,
              },
              card: {
                include: {
                  game: true,
                  set: true,
                  playRatings: {
                    orderBy: {
                      lastUpdated: "desc",
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  const ListingTypeIcon = getListingTypeIcon(listing.listingType);
  const trustLabel = getTrustLabel(
    listing.seller.role,
    listing.seller.kycStatus,
  );
  const sellerRating = getSellerRating(listing.seller.reputationScore);
  const riskReasons = getRiskReasons(listing.riskReasons);

  const firstCard = listing.items[0]?.cardVariant.card;
  const primaryImageUrl = firstCard?.imageUrl ?? null;

  const itemValue = listing.items.reduce((sum, item) => {
    const latestPrice = item.cardVariant.priceSnapshots[0]?.normalizedPrice ?? 0;
    return sum + latestPrice * item.quantity;
  }, 0);

  const playRatings = listing.items
    .map((item) => item.cardVariant.card.playRatings[0]?.rating)
    .filter((rating): rating is number => typeof rating === "number");

  const averagePlayRating =
    playRatings.length === 0
      ? 0
      : playRatings.reduce((sum, rating) => sum + rating, 0) /
        playRatings.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link href="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Marketplace
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="overflow-hidden rounded-3xl">
            <CardContent className="p-0">
              <div className="flex min-h-[520px] items-center justify-center bg-slate-950 p-8">
                {primaryImageUrl ? (
                  <img
                    src={primaryImageUrl}
                    alt={listing.title}
                    className="max-h-[460px] rounded-3xl object-contain shadow-2xl"
                  />
                ) : (
                  <div className="flex h-72 w-52 items-center justify-center rounded-3xl bg-white/10 text-white">
                    <ListingTypeIcon className="h-16 w-16" />
                  </div>
                )}
              </div>

              <div className="grid gap-4 bg-white p-6 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Typ</p>
                  <p className="mt-2 font-semibold">
                    {formatListingType(listing.listingType)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="mt-2 font-semibold">{listing.status}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Risk</p>
                  <p className="mt-2 font-semibold">
                    {listing.riskLevel} · {listing.riskScore}/100
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full">
                    {formatListingType(listing.listingType)}
                  </Badge>

                  {firstCard?.game?.name && (
                    <Badge variant="outline" className="rounded-full">
                      {firstCard.game.name}
                    </Badge>
                  )}

                  {listing.seller.kycStatus === "VERIFIED" && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                    >
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      KYC Verified
                    </Badge>
                  )}
                </div>

                <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
                  {listing.title}
                </h1>

                <p className="mt-4 text-lg leading-8 text-slate-600">
                  {listing.description ?? "Keine Beschreibung vorhanden."}
                </p>

                <div className="mt-8 flex flex-col gap-4 rounded-3xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Preis</p>
                    <p className="mt-1 text-4xl font-semibold">
                      {formatCurrency(listing.price)}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <form action={buyListingAction}>
                      <input
                        type="hidden"
                        name="listingId"
                        value={listing.id}
                      />

                      <Button
                        variant="secondary"
                        type="submit"
                        disabled={listing.status !== "ACTIVE"}
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        {listing.status === "ACTIVE"
                          ? "Kaufen"
                          : "Nicht verfügbar"}
                      </Button>
                    </form>

                    <Button
                      variant="outline"
                      className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    >
                      Verkäufer kontaktieren
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      {listing.seller.role === "TRUSTED_MEMBER" ? (
                        <Crown className="h-6 w-6" />
                      ) : (
                        <ShieldCheck className="h-6 w-6" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Verkäufer</p>
                      <h2 className="mt-1 text-xl font-semibold">
                        {listing.seller.displayName ?? listing.seller.username}
                      </h2>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">{trustLabel}</Badge>
                        <Badge variant="outline">
                          <Star className="mr-1 h-3.5 w-3.5 fill-slate-400 text-slate-400" />
                          {sellerRating}
                        </Badge>
                        <Badge variant="outline">
                          Reputation {listing.seller.reputationScore}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" asChild>
                    <Link href="/profile">Trust Center</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Verification & Risk
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Risk Score wird automatisch beim Erstellen des Listings
                      berechnet.
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={getRiskBadgeClass(listing.riskLevel)}
                  >
                    {listing.riskLevel} · {listing.riskScore}/100
                  </Badge>
                </div>

                {riskReasons.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {riskReasons.map((reason) => (
                      <Badge key={reason} variant="outline">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
                    Keine erhöhten Risiko-Gründe erkannt.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">Enthaltene Karten</h2>
              <p className="mt-1 text-sm text-slate-500">
                Karten, Varianten, Zustände und aktuelle Preisreferenz.
              </p>

              <div className="mt-6 space-y-4">
                {listing.items.map((item) => {
                  const variant = item.cardVariant;
                  const card = variant.card;
                  const latestPrice = variant.priceSnapshots[0];
                  const playRating = card.playRatings[0]?.rating ?? 0;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-4 rounded-3xl border bg-white p-4 md:flex-row md:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <CardImagePreview
                          src={card.imageUrl}
                          alt={card.name}
                          className="h-24 w-16 rounded-2xl"
                        >
                          <Sparkles className="h-6 w-6 text-slate-400" />
                        </CardImagePreview>

                        <div>
                          <p className="font-semibold">{card.name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {card.game.name} · {card.set?.name ?? "Unknown Set"} ·{" "}
                            {card.cardNumber ?? "—"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="outline">{variant.language}</Badge>

                            {variant.finish && (
                              <Badge variant="outline">{variant.finish}</Badge>
                            )}

                            <Badge variant="outline">
                              {formatCondition(item.condition)}
                            </Badge>

                            {playRating > 0 && (
                              <Badge variant="outline">
                                Play Rating {playRating.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="font-semibold">{item.quantity}x</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Ref:{" "}
                          {latestPrice
                            ? formatCurrency(latestPrice.normalizedPrice)
                            : "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {getTrendFromMetadata(card.metadata)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {listing.items.length === 0 && (
                  <div className="rounded-3xl border bg-white px-6 py-12 text-center text-slate-500">
                    Für dieses Listing sind noch keine Einzelkarten verknüpft.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {listing.binderSale && (
              <Card className="rounded-3xl">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                    <Layers3 className="h-6 w-6" />
                  </div>

                  <h2 className="text-xl font-semibold">Binder Sale</h2>

                  <p className="mt-2 leading-7 text-slate-600">
                    Dieses Listing nutzt den exklusiven Binder-Verkaufsflow.
                    AI-Erkennung und Binderseiten-Review sind vorbereitet.
                  </p>

                  <div className="mt-5 grid gap-3">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                      <span className="text-sm text-slate-500">
                        Estimated Value
                      </span>
                      <span className="font-semibold">
                        {listing.binderSale.estimatedValue
                          ? formatCurrency(listing.binderSale.estimatedValue)
                          : "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                      <span className="text-sm text-slate-500">
                        Detected Cards
                      </span>
                      <span className="font-semibold">
                        {listing.binderSale.detectedCardCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                      <span className="text-sm text-slate-500">
                        Confirmed Cards
                      </span>
                      <span className="font-semibold">
                        {listing.binderSale.confirmedCardCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-3xl bg-slate-950 text-white">
              <CardContent className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <BarChart3 className="h-6 w-6" />
                </div>

                <h2 className="text-xl font-semibold">Price Intelligence</h2>

                <p className="mt-2 leading-7 text-slate-300">
                  Später werden hier interne Verkäufe, eBay Last Solds,
                  TCGplayer, SNKRDUNK und weitere Quellen als Chart kombiniert.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                    <span className="text-sm text-slate-300">Listing Price</span>
                    <span className="font-semibold">
                      {formatCurrency(listing.price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                    <span className="text-sm text-slate-300">Item Ref Value</span>
                    <span className="font-semibold">
                      {itemValue > 0 ? formatCurrency(itemValue) : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                    <span className="text-sm text-slate-300">Ø Play Rating</span>
                    <span className="font-semibold">
                      {averagePlayRating > 0
                        ? averagePlayRating.toFixed(1)
                        : "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">Käuferschutz Preview</h2>

                <div className="mt-5 space-y-3">
                  {[
                    "Verkäuferstatus sichtbar",
                    "KYC-Status sichtbar",
                    "Risk Score berechnet",
                    "Listing kann durch Admin geprüft werden",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}