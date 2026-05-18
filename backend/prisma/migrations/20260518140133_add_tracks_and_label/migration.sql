-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "label" TEXT;

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "albumId" TEXT NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("spotifyId") ON DELETE RESTRICT ON UPDATE CASCADE;
