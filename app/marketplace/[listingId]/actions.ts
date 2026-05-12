"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function buyListingAction(formData: FormData) {
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
