-- CreateTable
CREATE TABLE "TradeReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TradeReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "TradeOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TradeReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TradeReview_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TradeReview_orderId_key" ON "TradeReview"("orderId");

-- CreateIndex
CREATE INDEX "TradeReview_reviewerId_idx" ON "TradeReview"("reviewerId");

-- CreateIndex
CREATE INDEX "TradeReview_sellerId_idx" ON "TradeReview"("sellerId");

-- CreateIndex
CREATE INDEX "TradeReview_rating_idx" ON "TradeReview"("rating");
