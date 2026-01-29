-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'stopped',
    "pairingCode" TEXT,
    "folderPath" TEXT,
    "processId" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'TEMPLATE',
    "template" TEXT NOT NULL DEFAULT 'sen-bot',
    "repoUrl" TEXT,
    "zipFilePath" TEXT,
    "startCommand" TEXT DEFAULT 'npm start',
    "envVars" TEXT,
    "nodeId" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    "lastDeductionAt" DATETIME,
    CONSTRAINT "Bot_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Bot_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bot" ("createdAt", "expiresAt", "folderPath", "id", "lastDeductionAt", "name", "nodeId", "ownerId", "pairingCode", "phoneNumber", "processId", "status", "template", "updatedAt") SELECT "createdAt", "expiresAt", "folderPath", "id", "lastDeductionAt", "name", "nodeId", "ownerId", "pairingCode", "phoneNumber", "processId", "status", "template", "updatedAt" FROM "Bot";
DROP TABLE "Bot";
ALTER TABLE "new_Bot" RENAME TO "Bot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
