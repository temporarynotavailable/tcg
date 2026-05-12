-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'BASIC_USER',
    "kycStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "reputationScore" INTEGER NOT NULL DEFAULT 0,
    "trustLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CardSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "releaseDate" DATETIME,
    "imageUrl" TEXT,
    CONSTRAINT "CardSet_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "setId" TEXT,
    "name" TEXT NOT NULL,
    "cardNumber" TEXT,
    "rarity" TEXT,
    "imageUrl" TEXT,
    "metadata" TEXT,
    "moderationStatus" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Card_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Card_setId_fkey" FOREIGN KEY ("setId") REFERENCES "CardSet" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Card_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "finish" TEXT,
    "edition" TEXT,
    "printing" TEXT,
    "productType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CardVariant_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CollectionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardVariantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "condition" TEXT NOT NULL,
    "acquiredPrice" REAL,
    "notes" TEXT,
    "isForSale" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CollectionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CollectionItem_cardVariantId_fkey" FOREIGN KEY ("cardVariantId") REFERENCES "CardVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "listingType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "cardVariantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "condition" TEXT NOT NULL,
    "language" TEXT,
    CONSTRAINT "ListingItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ListingItem_cardVariantId_fkey" FOREIGN KEY ("cardVariantId") REFERENCES "CardVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "playRating" REAL,
    "isForSale" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Deck_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeckCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deckId" TEXT NOT NULL,
    "cardVariantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "role" TEXT,
    CONSTRAINT "DeckCard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeckCard_cardVariantId_fkey" FOREIGN KEY ("cardVariantId") REFERENCES "CardVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BinderSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "estimatedValue" REAL,
    "detectedCardCount" INTEGER NOT NULL DEFAULT 0,
    "confirmedCardCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BinderSale_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BinderPageImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "binderSaleId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    CONSTRAINT "BinderPageImage_binderSaleId_fkey" FOREIGN KEY ("binderSaleId") REFERENCES "BinderSale" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetectedCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageId" TEXT NOT NULL,
    "cardId" TEXT,
    "confidence" REAL NOT NULL,
    "xPosition" REAL,
    "yPosition" REAL,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DetectedCard_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "BinderPageImage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "reliabilityScore" REAL NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardVariantId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawPrice" REAL NOT NULL,
    "normalizedPrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "condition" TEXT,
    "confidence" REAL NOT NULL DEFAULT 1,
    CONSTRAINT "PriceSnapshot_cardVariantId_fkey" FOREIGN KEY ("cardVariantId") REFERENCES "CardVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PriceSnapshot_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "PriceSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardPlayRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "usagePercent" REAL,
    "trend" TEXT,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CardPlayRating_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CardSet_gameId_name_key" ON "CardSet"("gameId", "name");

-- CreateIndex
CREATE INDEX "Card_gameId_idx" ON "Card"("gameId");

-- CreateIndex
CREATE INDEX "Card_setId_idx" ON "Card"("setId");

-- CreateIndex
CREATE INDEX "CardVariant_cardId_idx" ON "CardVariant"("cardId");

-- CreateIndex
CREATE INDEX "CollectionItem_userId_idx" ON "CollectionItem"("userId");

-- CreateIndex
CREATE INDEX "CollectionItem_cardVariantId_idx" ON "CollectionItem"("cardVariantId");

-- CreateIndex
CREATE INDEX "Listing_sellerId_idx" ON "Listing"("sellerId");

-- CreateIndex
CREATE INDEX "Listing_listingType_idx" ON "Listing"("listingType");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "ListingItem_listingId_idx" ON "ListingItem"("listingId");

-- CreateIndex
CREATE INDEX "ListingItem_cardVariantId_idx" ON "ListingItem"("cardVariantId");

-- CreateIndex
CREATE INDEX "Deck_userId_idx" ON "Deck"("userId");

-- CreateIndex
CREATE INDEX "Deck_gameId_idx" ON "Deck"("gameId");

-- CreateIndex
CREATE INDEX "DeckCard_deckId_idx" ON "DeckCard"("deckId");

-- CreateIndex
CREATE INDEX "DeckCard_cardVariantId_idx" ON "DeckCard"("cardVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "BinderSale_listingId_key" ON "BinderSale"("listingId");

-- CreateIndex
CREATE INDEX "DetectedCard_imageId_idx" ON "DetectedCard"("imageId");

-- CreateIndex
CREATE INDEX "DetectedCard_cardId_idx" ON "DetectedCard"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceSource_name_key" ON "PriceSource"("name");

-- CreateIndex
CREATE INDEX "PriceSnapshot_cardVariantId_idx" ON "PriceSnapshot"("cardVariantId");

-- CreateIndex
CREATE INDEX "PriceSnapshot_sourceId_idx" ON "PriceSnapshot"("sourceId");

-- CreateIndex
CREATE INDEX "PriceSnapshot_date_idx" ON "PriceSnapshot"("date");

-- CreateIndex
CREATE INDEX "CardPlayRating_cardId_idx" ON "CardPlayRating"("cardId");

-- CreateIndex
CREATE INDEX "CardPlayRating_gameId_idx" ON "CardPlayRating"("gameId");
