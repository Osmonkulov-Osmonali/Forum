/*
  Warnings:

  - You are about to drop the column `bio` on the `speakers` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `speakers` table. All the data in the column will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `speakers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `speakers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `speakers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_speakerId_fkey";

-- AlterTable
ALTER TABLE "speakers" DROP COLUMN "bio",
DROP COLUMN "role",
ADD COLUMN     "continent" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "position" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "company" DROP NOT NULL;

-- DropTable
DROP TABLE "sessions";

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registrations_createdAt_idx" ON "registrations"("createdAt");

-- CreateIndex
CREATE INDEX "speakers_visible_sortOrder_idx" ON "speakers"("visible", "sortOrder");
