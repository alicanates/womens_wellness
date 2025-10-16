/*
  Warnings:

  - The values [active,expired,cancelled] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `plan` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `renewsAt` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[originalTransactionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('APPLE', 'GOOGLE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INITIAL_PURCHASE', 'RENEWAL', 'UPGRADE', 'DOWNGRADE', 'REFUND');

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('FREE', 'TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'GRACE_PERIOD');
ALTER TABLE "Subscription" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "SubscriptionStatus_old";
ALTER TABLE "Subscription" ALTER COLUMN "status" SET DEFAULT 'FREE';
COMMIT;

-- DropIndex
DROP INDEX "idx_articles_category_active_priority";

-- DropIndex
DROP INDEX "idx_articles_published_active";

-- DropIndex
DROP INDEX "idx_articles_tags";

-- DropIndex
DROP INDEX "idx_content_prefs_user";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "plan",
DROP COLUMN "renewsAt",
ADD COLUMN     "aiMessagesLimit" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "aiMessagesUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "gracePeriodEndDate" TIMESTAMP(3),
ADD COLUMN     "hasHadTrial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isInGracePeriod" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latestReceiptData" TEXT,
ADD COLUMN     "originalTransactionId" TEXT,
ADD COLUMN     "provider" "PaymentProvider",
ADD COLUMN     "quotaResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "tier" "SubscriptionTier",
ADD COLUMN     "trialEndDate" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "SubscriptionTransaction" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "originalTransactionId" TEXT,
    "productId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "type" "TransactionType" NOT NULL,
    "receiptData" TEXT,
    "validatedAt" TIMESTAMP(3),
    "provider" "PaymentProvider" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumFeatureUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PremiumFeatureUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTransaction_transactionId_key" ON "SubscriptionTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_subscriptionId_idx" ON "SubscriptionTransaction"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_transactionId_idx" ON "SubscriptionTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "PremiumFeatureUsage_userId_idx" ON "PremiumFeatureUsage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PremiumFeatureUsage_userId_feature_key" ON "PremiumFeatureUsage"("userId", "feature");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_originalTransactionId_key" ON "Subscription"("originalTransactionId");

-- CreateIndex
CREATE INDEX "Subscription_status_endDate_idx" ON "Subscription"("status", "endDate");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- AddForeignKey
ALTER TABLE "SubscriptionTransaction" ADD CONSTRAINT "SubscriptionTransaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumFeatureUsage" ADD CONSTRAINT "PremiumFeatureUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
