-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT,
    "image" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastDailyCoinAt" DATETIME,
    "referralCode" TEXT,
    "referredById" TEXT,
    "emailVerified" DATETIME,
    "verificationToken" TEXT,
    "lastAdWatchAt" DATETIME,
    "dailyAdCount" INTEGER NOT NULL DEFAULT 0,
    "lastDailyAdReset" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumExpiresAt" DATETIME,
    CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("coins", "createdAt", "dailyAdCount", "email", "emailVerified", "id", "lastAdWatchAt", "lastDailyAdReset", "lastDailyCoinAt", "password", "referralCode", "referredById", "role", "updatedAt", "username", "verificationToken") SELECT "coins", "createdAt", "dailyAdCount", "email", "emailVerified", "id", "lastAdWatchAt", "lastDailyAdReset", "lastDailyCoinAt", "password", "referralCode", "referredById", "role", "updatedAt", "username", "verificationToken" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
