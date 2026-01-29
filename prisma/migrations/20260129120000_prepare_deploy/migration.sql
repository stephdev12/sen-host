-- AlterTable
ALTER TABLE "Bot" ADD COLUMN "envFileName" TEXT DEFAULT '.env';

-- AlterTable
ALTER TABLE "Template" ADD COLUMN "envFileName" TEXT DEFAULT '.env';
ALTER TABLE "Template" ADD COLUMN "sessionIdUrl" TEXT;
ALTER TABLE "Template" ADD COLUMN "startCommand" TEXT DEFAULT 'node index.js';

