-- CreateTable
CREATE TABLE "UserGamePreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserGamePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserGamePreference_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'BASIC_USER',
    "kycStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "reputationScore" INTEGER NOT NULL DEFAULT 0,
    "trustLevel" INTEGER NOT NULL DEFAULT 0,
    "passwordHash" TEXT,
    "favoriteGameId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_favoriteGameId_fkey" FOREIGN KEY ("favoriteGameId") REFERENCES "Game" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatarUrl", "createdAt", "displayName", "email", "id", "kycStatus", "reputationScore", "role", "trustLevel", "updatedAt", "username") SELECT "avatarUrl", "createdAt", "displayName", "email", "id", "kycStatus", "reputationScore", "role", "trustLevel", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "UserGamePreference_userId_idx" ON "UserGamePreference"("userId");

-- CreateIndex
CREATE INDEX "UserGamePreference_gameId_idx" ON "UserGamePreference"("gameId");

-- CreateIndex
CREATE INDEX "UserGamePreference_isFavorite_idx" ON "UserGamePreference"("isFavorite");

-- CreateIndex
CREATE UNIQUE INDEX "UserGamePreference_userId_gameId_key" ON "UserGamePreference"("userId", "gameId");
