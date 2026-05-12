import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Star,
} from "lucide-react";

import { CardImagePreview } from "@/components/cards/card-image-preview";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

export default async function OrdersPage() {
  const orders = await prisma.tradeOrder.findMany({
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

  const createdOrders = orders.filter((order) => order.status === "CREATED").length;
  const totalVolume = orders.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED",
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Badge className="mb-4 rounded-full px-4 py-1">
              Orders v0.1 · Buy Flow Connected
            </Badge>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Bestellungen
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Hier siehst du Käufe und Verkäufe, die durch den ersten Buy Flow
              erstellt wurden. Zahlungs-, Versand- und Escrow-Status kommen später.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/marketplace">Marketplace</Link>
            </Button>

            <Button asChild>
              <Link href="/dashboard">
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <ReceiptText className="h-5 w-5" />
              </div>

              <p className="text-sm text-slate-500">Orders</p>
              <p className="mt-2 text-3xl font-semibold">{orders.length}</p>
              <p className="mt-4 text-sm text-slate-500">
                Aus TradeOrder geladen
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
                Noch ohne echten Payment-Status
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-slate-950 text-white">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <ShoppingBag className="h-5 w-5" />
              </div>

              <p className="text-sm text-slate-400">Order Volume</p>
              <p className="mt-2 text-3xl font-semibold">
                {formatCurrency(totalVolume)}
              </p>
              <p className="mt-4 text-sm text-slate-400">
                {completedOrders} abgeschlossene Orders
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 rounded-3xl">
          <CardContent className="p-6">
            <div>
              <h2 className="text-xl font-semibold">Order Timeline</h2>
              <p className="mt-1 text-sm text-slate-500">
                Jede Bestellung entsteht durch einen Klick auf „Kaufen“ auf der
                Listing Detail Page.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {orders.map((order) => {
                const firstItem = order.items[0];
                const firstCard = firstItem?.cardVariant?.card;

                return (
                  <Card key={order.id} className="rounded-3xl border-slate-200">
                    <CardContent className="p-5">
                      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                        <div className="flex gap-4">
                          <CardImagePreview
                            src={firstCard?.imageUrl ?? null}
                            alt={order.listing.title}
                            className="h-24 w-16 rounded-2xl"
                          >
                            <PackageCheck className="h-6 w-6 text-slate-400" />
                          </CardImagePreview>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold">
                                {order.listing.title}
                              </h3>

                              <Badge
                                variant="outline"
                                className={getStatusBadgeClass(order.status)}
                              >
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

                            <div className="mt-5 space-y-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-2xl bg-slate-50 p-4 text-sm"
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
                          <Button variant="outline" asChild>
                            <Link href={`/marketplace/${order.listing.id}`}>
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
                Der nächste Ausbau ist Zahlungs- und Treuhandlogik.
              </h2>

              <p className="mt-3 max-w-2xl text-slate-300">
                Aktuell erstellt der Buy Flow eine Order und setzt das Listing auf
                SOLD. Später kommt davor Payment, danach Escrow, Versandstatus,
                Dispute und Bewertung.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["Payment", "Escrow", "Shipping", "Review"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 p-4">
                  <CheckCircle2 className="mb-3 h-5 w-5" />
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