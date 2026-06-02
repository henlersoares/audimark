-- AlterTable
ALTER TABLE "User" ADD COLUMN     "usernameChangeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usernameChangedAt" TIMESTAMP(3);
