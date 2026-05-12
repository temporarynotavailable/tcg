import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock,
  CreditCard,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

import { CardImagePreview } from "@/components/cards/card-image-preview";
import { GameAreaSwitcher } from "@/components/games/game-area-switcher";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getGameByRouteSlug,
  getGamesForNavigation,
} from "@/lib/game-routing";
import { prisma } from "@/lib/prisma";
import { calculateTrustLevel, clampReputationScore } from "@/lib/trust";

export const dynamic = "force-dynamic";
type OrdersPageProps = {
  params: Promise<{
    gameSlug: string;
  }>;
};
async function updateOrderStatusAction(formData: FormData) {
  "use server";

  const orderId = String(formData.get("orderId") ?? "").trim();
  const nextStatus = String(formData.get("nextStatus") ?? "").trim();
  const gameSlug = String(formData.get("gameSlug") ?? "").trim();

  if (!orderId) {
    throw new Error("Order ID fehlt.");
  }

  const allowedStatuses = [
    "CREATED",
    "PAID",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(nextStatus)) {
    throw new Error("Ungültiger Order-Status.");
  }

  const order = await prisma.tradeOrder.findUnique({
    where: {
      id: orderId,
    },
    include: {
      seller: true,
    },
  });

  if (!order) {
    throw new Error("Order wurde nicht gefunden.");
  }

  const allowedTransitions: Record<string, string[]> = {
    CREATED: ["PAID", "CANCELLED"],
    PAID: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
  };

  const possibleNextStatuses = allowedTransitions[order.status] ?? [];

  if (!possibleNextStatuses.includes(nextStatus)) {
    throw new Error(
      `Statuswechsel von ${order.status} zu ${nextStatus} ist nicht erlaubt.`,
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.tradeOrder.update({
      where: {
        id: order.id,
      },
      data: {
        status: nextStatus,
      },
    });

    if (nextStatus === "COMPLETED") {
      const newReputationScore = clampReputationScore(
        order.seller.reputationScore + 5,
      );

      const newTrustLevel = calculateTrustLevel(newReputationScore);

      await tx.user.update({
        where: {
          id: order.sellerId,
        },
        data: {
          reputationScore: newReputationScore,
          trustLevel: newTrustLevel,
          role:
            newTrustLevel >= 3 && order.seller.kycStatus === "VERIFIED"
              ? "TRUSTED_MEMBER"
              : order.seller.role,
        },
      });
    }
  });

revalidatePath("/orders");

if (gameSlug) {
  revalidatePath(`/${gameSlug}/orders`);
}

revalidatePath("/dashboard");
revalidatePath("/profile");
revalidatePath("/admin");
}

async function createTradeReviewAction(formData: FormData) {
  "use server";

  const orderId = String(formData.get("orderId") ?? "").trim();
  const ratingValue = String(formData.get("rating") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();
  const gameSlug = String(formData.get("gameSlug") ?? "").trim();

  const rating = Number(ratingValue);

  if (!orderId) {
    throw new Error("Order ID fehlt.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Bitte wähle eine Bewertung zwischen 1 und 5 Sternen.");
  }

  const order = await prisma.tradeOrder.findUnique({
    where: {
      id: orderId,
    },
    include: {
      seller: true,
      review: true,
    },
  });

  if (!order) {
    throw new Error("Order wurde nicht gefunden.");
  }

  if (order.status !== "COMPLETED") {
    throw new Error("Nur abgeschlossene Orders können bewertet werden.");
  }

  if (order.review) {
    throw new Error("Diese Order wurde bereits bewertet.");
  }

  const reputationDelta = calculateReviewReputationDelta(rating);

  await prisma.$transaction(async (tx) => {
    await tx.tradeReview.create({
      data: {
        orderId: order.id,
        reviewerId: order.buyerId,
        sellerId: order.sellerId,
        rating,
        comment: comment || null,
      },
    });

    const newReputationScore = clampReputationScore(
      order.seller.reputationScore + reputationDelta,
    );

    const newTrustLevel = calculateTrustLevel(newReputationScore);

    await tx.user.update({
      where: {
        id: order.sellerId,
      },
      data: {
        reputationScore: newReputationScore,
        trustLevel: newTrustLevel,
        role: getRoleAfterReputationUpdate({
          currentRole: order.seller.role,
          kycStatus: order.seller.kycStatus,
          trustLevel: newTrustLevel,
        }),
      },
    });
  });

revalidatePath("/orders");

if (gameSlug) {
  revalidatePath(`/${gameSlug}/orders`);
}

revalidatePath("/dashboard");
revalidatePath("/profile");
revalidatePath("/admin");
}
function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function getStatusBadgeClass(status: string) {
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

function getStatusIcon(status: string) {
  if (status === "CREATED") return Clock;
  if (status === "PAID") return CreditCard;
  if (status === "SHIPPED") return Truck;
  if (status === "COMPLETED") return CheckCircle2;
  if (status === "CANCELLED") return Ban;

  return ReceiptText;
}

function getStatusDescription(status: string) {
  const map: Record<string, string> = {
    CREATED:
      "Order wurde erstellt. In der echten Plattform würde jetzt die Zahlung gestartet.",
    PAID:
      "Zahlung wurde simuliert. Später wäre hier Stripe/Escrow angebunden.",
    SHIPPED:
      "Versand wurde simuliert. Später kommt hier Tracking und Versanddienstleister.",
    COMPLETED:
      "Order wurde abgeschlossen. Später folgen Bewertungen und Reputation-Update.",
    CANCELLED:
      "Order wurde abgebrochen. Später kann hier Refund/Dispute-Logik greifen.",
  };

  return map[status] ?? "Unbekannter Status.";
}

function getNextActions(status: string) {
  if (status === "CREATED") {
    return [
      {
        label: "Zahlung simulieren",
        nextStatus: "PAID",
        icon: CreditCard,
        variant: "default" as const,
      },
      {
        label: "Abbrechen",
        nextStatus: "CANCELLED",
        icon: Ban,
        variant: "outline" as const,
      },
    ];
  }

  if (status === "PAID") {
    return [
      {
        label: "Versand bestätigen",
        nextStatus: "SHIPPED",
        icon: Truck,
        variant: "default" as const,
      },
      {
        label: "Abbrechen",
        nextStatus: "CANCELLED",
        icon: Ban,
        variant: "outline" as const,
      },
    ];
  }

  if (status === "SHIPPED") {
    return [
      {
        label: "Order abschließen",
        nextStatus: "COMPLETED",
        icon: CheckCircle2,
        variant: "default" as const,
      },
    ];
  }

  return [];
}
function calculateReviewReputationDelta(rating: number) {
  if (rating === 5) return 2;
  if (rating === 4) return 1;
  if (rating === 3) return 0;
  if (rating === 2) return -2;
  return -5;
}

function getRoleAfterReputationUpdate(input: {
  currentRole: string;
  kycStatus: string;
  trustLevel: number;
}) {
  if (input.currentRole === "ADMIN" || input.currentRole === "MODERATOR") {
    return input.currentRole;
  }

  if (input.trustLevel >= 3 && input.kycStatus === "VERIFIED") {
    return "TRUSTED_MEMBER";
  }

  if (input.kycStatus === "VERIFIED") {
    return "VERIFIED_USER";
  }

  return "BASIC_USER";
}

function getRatingLabel(rating: number) {
  if (rating === 5) return "Exzellent";
  if (rating === 4) return "Sehr gut";
  if (rating === 3) return "Okay";
  if (rating === 2) return "Problematisch";
  return "Schlecht";
}
function getProgressPercent(status: string) {
  const map: Record<string, number> = {
    CREATED: 25,
    PAID: 50,
    SHIPPED: 75,
    COMPLETED: 100,
    CANCELLED: 100,
  };

  return map[status] ?? 0;
}

function OrderStatusStepper({ status }: { status: string }) {
  const steps = [
    {
      key: "CREATED",
      label: "Erstellt",
    },
    {
      key: "PAID",
      label: "Bezahlt",
    },
    {
      key: "SHIPPED",
      label: "Versendet",
    },
    {
      key: "COMPLETED",
      label: "Abgeschlossen",
    },
  ];

  const activeIndex = steps.findIndex((step) => step.key === status);
  const isCancelled = status === "CANCELLED";

  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium">Order Fortschritt</span>
        <span className="text-slate-500">{getProgressPercent(status)}%</span>
      </div>

      <div className="h-2 rounded-full bg-slate-200">
        <div
          className={`h-2 rounded-full ${
            isCancelled ? "bg-red-500" : "bg-slate-950"
          }`}
          style={{ width: `${getProgressPercent(status)}%` }}
        />
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const isActive = !isCancelled && index <= activeIndex;

          return (
            <div
              key={step.key}
              className={`rounded-xl px-3 py-2 text-xs ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-500"
              }`}
            >
              {step.label}
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
          Diese Order wurde abgebrochen.
        </div>
      )}
    </div>
  );
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { gameSlug } = await params;

  const selectedGame = await getGameByRouteSlug(gameSlug);
  const games = await getGamesForNavigation();
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
    review: true,
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

  const createdOrders = orders.filter((order) => order.status === "CREATED").length;
  const paidOrders = orders.filter((order) => order.status === "PAID").length;
  const shippedOrders = orders.filter((order) => order.status === "SHIPPED").length;
  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED",
  ).length;

  const totalVolume = orders.reduce((sum, order) => sum + order.total, 0);
  const completedVolume = orders
    .filter((order) => order.status === "COMPLETED")
    .reduce((sum, order) => sum + order.total, 0);

return (
  <main className="min-h-screen bg-slate-50 text-slate-950">
    <SiteHeader />

    <section className="mx-auto max-w-7xl px-6 pt-8">
<GameAreaSwitcher
  games={games}
  selectedGame={selectedGame}
  sectionPath="/orders"
/>
    </section>

    <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Badge className="mb-4 rounded-full px-4 py-1">
              Orders v0.2 · Status Workflow
            </Badge>

<h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
  Bestellungen
</h1>

<p className="mt-3 max-w-2xl text-slate-600">
  Bestellungen werden jetzt nach aktivem TCG gefiltert. Aktuell angezeigt:{" "}
  <span className="font-medium text-slate-950">{selectedGame.name}</span>.
  Der Status-Workflow bleibt pro TCG sauber getrennt.
</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={`/${selectedGame.slug}/marketplace`}>Marketplace</Link>
            </Button>

            <Button asChild>
              <Link href={`/dashboard?game=${selectedGame.slug}`}>
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <ReceiptText className="h-5 w-5" />
              </div>

<p className="text-sm text-slate-500">Orders</p>
<p className="mt-2 text-3xl font-semibold">{orders.length}</p>
<p className="mt-4 text-sm text-slate-500">
  {selectedGame.name} · {formatCurrency(totalVolume)}
  </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Clock className="h-5 w-5" />
              </div>

              <p className="text-sm text-slate-500">Created</p>
              <p className="mt-2 text-3xl font-semibold">{createdOrders}</p>
              <p className="mt-4 text-sm text-slate-500">
                Warten auf Zahlung
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <Truck className="h-5 w-5" />
              </div>

              <p className="text-sm text-slate-500">In Progress</p>
              <p className="mt-2 text-3xl font-semibold">
                {paidOrders + shippedOrders}
              </p>
              <p className="mt-4 text-sm text-slate-500">
                Bezahlt oder versendet
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
                {formatCurrency(completedVolume)} abgeschlossen
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 rounded-3xl">
          <CardContent className="p-6">
            <div>
              <h2 className="text-xl font-semibold">Order Timeline</h2>
              <p className="mt-1 text-sm text-slate-500">
                Jede Bestellung kann jetzt über sichere Statusübergänge
                weitergeschaltet werden.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {orders.map((order) => {
                const firstItem = order.items[0];
                const firstCard = firstItem?.cardVariant?.card;
                const StatusIcon = getStatusIcon(order.status);
                const nextActions = getNextActions(order.status);

                return (
                  <Card key={order.id} className="rounded-3xl border-slate-200">
                    <CardContent className="p-5">
                      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                        <div className="flex flex-1 gap-4">
                          <CardImagePreview
                            src={firstCard?.imageUrl ?? null}
                            alt={order.listing.title}
                            className="h-24 w-16 rounded-2xl"
                          >
                            <PackageCheck className="h-6 w-6 text-slate-400" />
                          </CardImagePreview>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold">
                                {order.listing.title}
                              </h3>

                              <Badge
                                variant="outline"
                                className={getStatusBadgeClass(order.status)}
                              >
                                <StatusIcon className="mr-1 h-3.5 w-3.5" />
                                {order.status}
                              </Badge>
                            </div>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              Order vom {formatDate(order.createdAt)} · Käufer{" "}
                              {order.buyer.displayName ?? order.buyer.username} · Verkäufer{" "}
                              {order.seller.displayName ?? order.seller.username}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <Badge variant="outline">
                                {formatCurrency(order.total)}
                              </Badge>

                              <Badge variant="outline">
                                {order.items.length} Item(s)
                              </Badge>

                              <Badge variant="outline">
                                Listing Status: {order.listing.status}
                              </Badge>
                            </div>

                            <div className="mt-5">
                              <OrderStatusStepper status={order.status} />
                            </div>

<div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
  {getStatusDescription(order.status)}

  {order.status === "COMPLETED" && (
    <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
      Verkäufer-Reputation wurde für diese abgeschlossene Order erhöht.
    </div>
  )}
</div>

{order.status === "COMPLETED" && (
  <div className="mt-5 rounded-2xl border bg-white p-4">
    {order.review ? (
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">Bewertung abgegeben</p>

          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            {order.review.rating}/5 · {getRatingLabel(order.review.rating)}
          </Badge>
        </div>

        {order.review.comment && (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {order.review.comment}
          </p>
        )}

        <p className="mt-3 text-xs text-slate-500">
          Diese Bewertung wurde in die Verkäufer-Reputation einbezogen.
        </p>
      </div>
    ) : (
<form action={createTradeReviewAction} className="space-y-4">
  <input type="hidden" name="orderId" value={order.id} />
  <input type="hidden" name="gameSlug" value={selectedGame.slug} />

        <div>
          <p className="font-medium">Verkäufer bewerten</p>
          <p className="mt-1 text-sm text-slate-500">
            Deine Bewertung beeinflusst die Reputation von{" "}
            {order.seller.displayName ?? order.seller.username}.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Bewertung</label>
          <select
            name="rating"
            defaultValue="5"
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="5">5 Sterne · Exzellent</option>
            <option value="4">4 Sterne · Sehr gut</option>
            <option value="3">3 Sterne · Okay</option>
            <option value="2">2 Sterne · Problematisch</option>
            <option value="1">1 Stern · Schlecht</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Kommentar</label>
          <textarea
            name="comment"
            className="mt-2 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="z.B. schnelle Lieferung, gute Verpackung, Zustand wie beschrieben..."
          />
        </div>

        <Button type="submit">
          <Star className="mr-2 h-4 w-4" />
          Bewertung speichern
        </Button>
      </form>
    )}
  </div>
)}

                            <div className="mt-5 space-y-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-2xl bg-white p-4 text-sm ring-1 ring-slate-100"
                                >
                                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                                    <div>
                                      <p className="font-medium">{item.title}</p>
                                      <p className="mt-1 text-slate-500">
                                        Menge {item.quantity} · Stückpreis{" "}
                                        {formatCurrency(item.unitPrice)}
                                      </p>
                                    </div>

                                    {item.cardVariant?.card && (
                                      <Badge variant="outline">
                                        {item.cardVariant.card.game.name}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-2 lg:w-64">
                          {nextActions.map((action) => {
                            const Icon = action.icon;

                            return (
                              <form
                                key={action.nextStatus}
                                action={updateOrderStatusAction}
                              >
                                <input
                                  type="hidden"
                                  name="orderId"
                                  value={order.id}
                                />
                                <input
                                  type="hidden"
                                  name="nextStatus"
                                  value={action.nextStatus}
                                />
                                <input
  type="hidden"
  name="gameSlug"
  value={selectedGame.slug}
/>
                                <Button
                                  className="w-full"
                                  variant={action.variant}
                                  type="submit"
                                >
                                  <Icon className="mr-2 h-4 w-4" />
                                  {action.label}
                                </Button>
                              </form>
                            );
                          })}

                          {nextActions.length === 0 && (
                            <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                              Keine weitere Aktion verfügbar.
                            </div>
                          )}

                          <Button variant="outline" asChild>
                            <Link href={`/${selectedGame.slug}/marketplace/${order.listing.id}`}>
                              Listing ansehen
                            </Link>
                          </Button>

                          <Button variant="outline">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Trust Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {orders.length === 0 && (
                <div className="rounded-3xl border bg-white px-6 py-16 text-center text-slate-500">
                  Noch keine Bestellungen vorhanden. Kaufe testweise ein aktives
                  Listing im Marketplace.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 rounded-3xl bg-slate-950 text-white">
          <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div>
              <Badge variant="secondary" className="mb-4 rounded-full">
                Next: Payment & Escrow
              </Badge>

              <h2 className="text-3xl font-semibold">
                Der Status-Workflow ist die Grundlage für Treuhandlogik.
              </h2>

              <p className="mt-3 max-w-2xl text-slate-300">
                Aktuell simulieren wir Payment und Versand. Später werden daraus
                echte Stripe-Events, Escrow-Freigaben, Versandtracking, Disputes
                und Bewertungen.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["Payment", "Escrow", "Shipping", "Review"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 p-4">
                  <Star className="mb-3 h-5 w-5" />
                  <p className="text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}