-- CreateTable
CREATE TABLE "TradeOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "total" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TradeOrder_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TradeOrder_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TradeOrder_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TradeOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "listingItemId" TEXT,
    "cardVariantId" TEXT,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL,
    CONSTRAINT "TradeOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "TradeOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TradeOrderItem_listingItemId_fkey" FOREIGN KEY ("listingItemId") REFERENCES "ListingItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TradeOrderItem_cardVariantId_fkey" FOREIGN KEY ("cardVariantId") REFERENCES "CardVariant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TradeOrder_listingId_key" ON "TradeOrder"("listingId");

-- CreateIndex
CREATE INDEX "TradeOrder_buyerId_idx" ON "TradeOrder"("buyerId");

-- CreateIndex
CREATE INDEX "TradeOrder_sellerId_idx" ON "TradeOrder"("sellerId");

-- CreateIndex
CREATE INDEX "TradeOrder_status_idx" ON "TradeOrder"("status");

-- CreateIndex
CREATE INDEX "TradeOrderItem_orderId_idx" ON "TradeOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "TradeOrderItem_listingItemId_idx" ON "TradeOrderItem"("listingItemId");

-- CreateIndex
CREATE INDEX "TradeOrderItem_cardVariantId_idx" ON "TradeOrderItem"("cardVariantId");
