import { CardImagePreview } from "@/components/cards/card-image-preview";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  CheckCircle2,
  CreditCard,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Trophy,
  Truck,
} from "lucide-react";

import { GameSwitcher } from "@/components/games/game-switcher";
import { SiteHeader } from "@/components/layout/site-header";
import { getAvailableGames, getSelectedGame } from "@/lib/game-scope";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";
type DashboardPageProps = {
  searchParams?: Promise<{
    game?: string;
  }>;
};
function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
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

function getTrustStatus(role?: string | null, kycStatus?: string | null) {
  if (role === "TRUSTED_MEMBER") return "Trusted Member";
  if (kycStatus === "VERIFIED") return "Verified";
  return "Basic";
}
function getOrderStatusBadgeClass(status: string) {
  if (status === "CREATED") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (status === "PAID") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "SHIPPED") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  if (status === "COMPLETED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "CANCELLED") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-white text-slate-700";
}
export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedGame = await getSelectedGame(resolvedSearchParams);
  const games = await getAvailableGames();
  const user = await prisma.user.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

const collectionItems = await prisma.collectionItem.findMany({
  where: {
    gameId: selectedGame.id,
  },
  orderBy: {
    createdAt: "desc",
  },
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
  });

const activeListings = await prisma.listing.findMany({
  where: {
    status: "ACTIVE",
    gameId: selectedGame.id,
  },
  orderBy: {
    createdAt: "desc",
  },
  include: {
    seller: true,
  },
});

const decks = await prisma.deck.findMany({
  where: {
    gameId: selectedGame.id,
  },
  orderBy: {
    createdAt: "desc",
  },
  include: {
    game: true,
    cards: true,
  },
});

const orders = await prisma.tradeOrder.findMany({
  where: {
    gameId: selectedGame.id,
  },
  orderBy: {
    createdAt: "desc",
  },
  include: {
    buyer: true,
    seller: true,
    listing: true,
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

const priceSourceCount = await prisma.priceSource.count();

  const totalCards = collectionItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const totalCollectionValue = collectionItems.reduce((sum, item) => {
    const latestPrice = item.cardVariant.priceSnapshots[0];
    const value = latestPrice?.normalizedPrice ?? item.acquiredPrice ?? 0;

    return sum + value * item.quantity;
  }, 0);

  const listingValue = activeListings.reduce(
    (sum, listing) => sum + listing.price,
    0,
  );
const orderVolume = orders.reduce((sum, order) => sum + order.total, 0);

const createdOrders = orders.filter(
  (order) => order.status === "CREATED",
).length;

const paidOrders = orders.filter(
  (order) => order.status === "PAID",
).length;

const shippedOrders = orders.filter(
  (order) => order.status === "SHIPPED",
).length;

const completedOrders = orders.filter(
  (order) => order.status === "COMPLETED",
).length;

const openOrders = orders.filter((order) =>
  ["CREATED", "PAID", "SHIPPED"].includes(order.status),
).length;

const recentOrders = orders.slice(0, 3).map((order) => {
  const firstItem = order.items[0];
  const firstCard = firstItem?.cardVariant?.card;

  return {
    id: order.id,
    listingId: order.listingId,
    title: order.listing.title,
    status: order.status,
    total: order.total,
    buyer: order.buyer.displayName ?? order.buyer.username,
    seller: order.seller.displayName ?? order.seller.username,
    imageUrl: firstCard?.imageUrl ?? null,
  };
});
  const playRatings = collectionItems
    .map((item) => item.cardVariant.card.playRatings[0]?.rating)
    .filter((rating): rating is number => typeof rating === "number");

  const averagePlayRating =
    playRatings.length === 0
      ? 0
      : playRatings.reduce((sum, rating) => sum + rating, 0) /
        playRatings.length;

  const trustStatus = getTrustStatus(user?.role, user?.kycStatus);

  const recentCards = collectionItems.slice(0, 3).map((item) => {
    const variant = item.cardVariant;
    const card = variant.card;
    const latestPrice = variant.priceSnapshots[0];
    const playRating = card.playRatings[0]?.rating ?? 0;

return {
  name: card.name,
  imageUrl: card.imageUrl,
  game: card.game.name,
  tag:
    playRating > 0
      ? `Play Rating ${playRating.toFixed(1)}`
      : getTrendFromMetadata(card.metadata),
  value: latestPrice?.normalizedPrice ?? item.acquiredPrice ?? 0,
  quantity: item.quantity,
};
  });

const stats = [
{
  label: "Portfolio Value",
  value: formatCurrency(totalCollectionValue),
  change: `${selectedGame.name} · ${priceSourceCount} Preisquellen`,
  icon: BarChart3,
},
{
  label: "Cards in Collection",
  value: String(totalCards),
  change: `${collectionItems.length} Items in ${selectedGame.name}`,
  icon: Boxes,
},
  {
    label: "Trust Status",
    value: trustStatus,
    change: user
      ? `Reputation ${user.reputationScore} · Level ${user.trustLevel}`
      : "Kein Demo-User gefunden",
    icon: ShieldCheck,
  },
{
  label: "Open Orders",
  value: String(openOrders),
  change: `${formatCurrency(orderVolume)} ${selectedGame.name} Volume`,
  icon: ReceiptText,
},
];

  const actions = [
    {
      title: "Karte scannen",
      description:
        "Füge Karten später per AI-Erkennung direkt zu deiner Sammlung hinzu.",
      icon: Bot,
      href: "/collection",
    },
    {
      title: "Deck bauen",
      description:
        "Erstelle Turnierdecks und prüfe, welche Karten dir noch fehlen.",
      icon: Trophy,
      href: "/decks",
    },
    {
      title: "Verkaufen",
      description:
        "Starte ein Listing für Einzelkarten, Decks, Binder oder Sammlungen.",
      icon: CreditCard,
      href: "/sell",
    },
  ];

return (
  <main className="min-h-screen bg-slate-50 text-slate-950">
    <SiteHeader />

    <section className="mx-auto max-w-7xl px-6 pt-8">
      <GameSwitcher
        games={games}
        selectedGame={selectedGame}
        pathname="/dashboard"
      />
    </section>

    <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Badge className="mb-4 rounded-full px-4 py-1">
              Dashboard v0.2 · Database Connected
            </Badge>

<h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
  Willkommen zurück{user?.displayName ? `, ${user.displayName}` : ""}.
</h1>

<p className="mt-3 max-w-2xl text-slate-600">
  Dein Dashboard zeigt jetzt nur Daten für{" "}
  <span className="font-medium text-slate-950">{selectedGame.name}</span>.
  Sammlung, Listings, Orders, Decks, Preisquellen, Trust-Level und Play Ratings
  werden nach aktivem TCG gefiltert.
</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={`/${selectedGame.slug}/marketplace`}>Marketplace</Link>
            </Button>

            <Button asChild>
              <Link href={`/sell?game=${selectedGame.slug}`}>
                Neues Listing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.label} className="rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="mt-2 text-3xl font-semibold">
                        {stat.value}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-500">{stat.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Collection Highlights
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Direkt aus CollectionItem, CardVariant, Card und
                    PriceSnapshot geladen.
                  </p>
                </div>

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/collection?game=${selectedGame.slug}`}>Sammlung öffnen</Link>
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                {recentCards.map((card) => (
                  <div
                    key={card.name}
                    className="flex items-center justify-between rounded-2xl border bg-white p-4"
                  >
<div className="flex items-center gap-4">
<CardImagePreview
  src={card.imageUrl}
  alt={card.name}
  className="h-20 w-14 rounded-xl"
>
  <Boxes className="h-5 w-5 text-slate-400" />
</CardImagePreview>

  <div>
    <p className="font-medium">{card.name}</p>
    <p className="text-sm text-slate-500">
      {card.game} · {card.tag} · {card.quantity}x
    </p>
  </div>
</div>

                    <p className="font-semibold">
                      {formatCurrency(card.value * card.quantity)}
                    </p>
                  </div>
                ))}

                {recentCards.length === 0 && (
                  <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-500">
                    Noch keine Karten in der Sammlung.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl bg-slate-950 text-white">
            <CardContent className="p-6">
              <Badge variant="secondary" className="mb-5 rounded-full">
                Price Intelligence Preview
              </Badge>

              <h2 className="text-2xl font-semibold">
                Preis-Engine ist vorbereitet.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                In der Datenbank liegen bereits PriceSource und PriceSnapshot.
                Später können hier interne Verkäufe, eBay Last Solds, TCGplayer,
                SNKRDUNK und weitere Quellen gewichtet werden.
              </p>

              <div className="mt-8 space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Collection Value</span>
                    <span>{formatCurrency(totalCollectionValue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[72%] rounded-full bg-white" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Listing Value</span>
                    <span>{formatCurrency(listingValue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[48%] rounded-full bg-white" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Ø Play Rating</span>
                    <span>{averagePlayRating.toFixed(1)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-white"
                      style={{
                        width: `${Math.min(100, averagePlayRating * 10)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Card key={action.title} className="rounded-3xl">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-lg font-semibold">{action.title}</h3>

                  <p className="mt-2 min-h-16 leading-7 text-slate-600">
                    {action.description}
                  </p>

                  <Button className="mt-5 w-full" variant="outline" asChild>
                    <Link href={action.href}>
                      Öffnen
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

<div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
  <Card className="rounded-3xl">
    <CardContent className="p-6">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <ReceiptText className="h-5 w-5" />
      </div>

      <p className="text-sm text-slate-500">Created Orders</p>
      <p className="mt-2 text-3xl font-semibold">{createdOrders}</p>
      <p className="mt-4 text-sm text-slate-500">
        Warten auf Zahlung
      </p>
    </CardContent>
  </Card>

  <Card className="rounded-3xl">
    <CardContent className="p-6">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <CreditCard className="h-5 w-5" />
      </div>

      <p className="text-sm text-slate-500">Paid Orders</p>
      <p className="mt-2 text-3xl font-semibold">{paidOrders}</p>
      <p className="mt-4 text-sm text-slate-500">
        Zahlung simuliert
      </p>
    </CardContent>
  </Card>

  <Card className="rounded-3xl">
    <CardContent className="p-6">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
        <Truck className="h-5 w-5" />
      </div>

      <p className="text-sm text-slate-500">Shipped Orders</p>
      <p className="mt-2 text-3xl font-semibold">{shippedOrders}</p>
      <p className="mt-4 text-sm text-slate-500">
        Versand bestätigt
      </p>
    </CardContent>
  </Card>

  <Card className="rounded-3xl bg-slate-950 text-white">
    <CardContent className="p-6">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
        <CheckCircle2 className="h-5 w-5" />
      </div>

      <p className="text-sm text-slate-400">Completed</p>
      <p className="mt-2 text-3xl font-semibold">{completedOrders}</p>
      <p className="mt-4 text-sm text-slate-400">
        Abgeschlossene Trades
      </p>
    </CardContent>
  </Card>
</div>
<Card className="mt-8 rounded-3xl">
  <CardContent className="p-6">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h2 className="text-xl font-semibold">Recent Orders</h2>
        <p className="mt-1 text-sm text-slate-500">
          Die letzten Käufe aus TradeOrder und TradeOrderItem.
        </p>
      </div>

      <Button variant="outline" size="sm" asChild>
        <Link href={`/${selectedGame.slug}/orders`}>Alle Bestellungen ansehen</Link>
      </Button>
    </div>

    <div className="mt-6 space-y-4">
      {recentOrders.map((order) => (
        <div
          key={order.id}
          className="flex flex-col justify-between gap-4 rounded-3xl border bg-white p-4 md:flex-row md:items-center"
        >
          <div className="flex items-center gap-4">
            <CardImagePreview
              src={order.imageUrl}
              alt={order.title}
              className="h-20 w-14 rounded-xl"
            >
              <PackageCheck className="h-5 w-5 text-slate-400" />
            </CardImagePreview>

            <div>
              <p className="font-medium">{order.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                Käufer {order.buyer} · Verkäufer {order.seller}
              </p>

              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={getOrderStatusBadgeClass(order.status)}
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:text-right">
            <div>
              <p className="font-semibold">{formatCurrency(order.total)}</p>
              <p className="text-xs text-slate-500">Order Value</p>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href={`/marketplace/${order.listingId}`}>
                Listing
              </Link>
            </Button>
          </div>
        </div>
      ))}

      {recentOrders.length === 0 && (
        <div className="rounded-3xl border bg-white px-6 py-12 text-center text-slate-500">
          Noch keine Bestellungen vorhanden.
        </div>
      )}
    </div>
  </CardContent>
</Card>
      </section>
    </main>
  );
}