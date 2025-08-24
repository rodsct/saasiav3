/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Download` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."SubscriptionType" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "public"."DownloadAccessLevel" AS ENUM ('PUBLIC', 'REGISTERED', 'PREMIUM');

-- AlterTable
ALTER TABLE "public"."Download" DROP COLUMN "isPublic",
ADD COLUMN     "accessLevel" "public"."DownloadAccessLevel" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "category" TEXT,
ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "subscription" "public"."SubscriptionType" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3);
