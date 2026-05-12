-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CollectionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardVariantId" TEXT NOT NULL,
    "gameId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "condition" TEXT NOT NULL,
    "acquiredPrice" REAL,
    "notes" TEXT,
    "isForSale" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CollectionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CollectionItem_cardVariantId_fkey" FOREIGN KEY ("cardVariantId") REFERENCES "CardVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CollectionItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CollectionItem" ("acquiredPrice", "cardVariantId", "condition", "createdAt", "id", "isForSale", "notes", "quantity", "updatedAt", "userId") SELECT "acquiredPrice", "cardVariantId", "condition", "createdAt", "id", "isForSale", "notes", "quantity", "updatedAt", "userId" FROM "CollectionItem";
DROP TABLE "CollectionItem";
ALTER TABLE "new_CollectionItem" RENAME TO "CollectionItem";
CREATE INDEX "CollectionItem_userId_idx" ON "CollectionItem"("userId");
CREATE INDEX "CollectionItem_cardVariantId_idx" ON "CollectionItem"("cardVariantId");
CREATE INDEX "CollectionItem_gameId_idx" ON "CollectionItem"("gameId");
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "gameId" TEXT,
    "listingType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "riskReasons" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Listing_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("createdAt", "currency", "description", "id", "listingType", "price", "riskLevel", "riskReasons", "riskScore", "sellerId", "status", "title", "updatedAt") SELECT "createdAt", "currency", "description", "id", "listingType", "price", "riskLevel", "riskReasons", "riskScore", "sellerId", "status", "title", "updatedAt" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE INDEX "Listing_sellerId_idx" ON "Listing"("sellerId");
CREATE INDEX "Listing_gameId_idx" ON "Listing"("gameId");
CREATE INDEX "Listing_listingType_idx" ON "Listing"("listingType");
CREATE INDEX "Listing_status_idx" ON "Listing"("status");
CREATE INDEX "Listing_riskLevel_idx" ON "Listing"("riskLevel");
CREATE TABLE "new_TradeOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "gameId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "total" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TradeOrder_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TradeOrder_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TradeOrder_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TradeOrder_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TradeOrder" ("buyerId", "createdAt", "currency", "id", "listingId", "sellerId", "status", "total", "updatedAt") SELECT "buyerId", "createdAt", "currency", "id", "listingId", "sellerId", "status", "total", "updatedAt" FROM "TradeOrder";
DROP TABLE "TradeOrder";
ALTER TABLE "new_TradeOrder" RENAME TO "TradeOrder";
CREATE UNIQUE INDEX "TradeOrder_listingId_key" ON "TradeOrder"("listingId");
CREATE INDEX "TradeOrder_buyerId_idx" ON "TradeOrder"("buyerId");
CREATE INDEX "TradeOrder_sellerId_idx" ON "TradeOrder"("sellerId");
CREATE INDEX "TradeOrder_gameId_idx" ON "TradeOrder"("gameId");
CREATE INDEX "TradeOrder_status_idx" ON "TradeOrder"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
