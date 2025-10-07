-- CreateTable
CREATE TABLE "UserHomePreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dismissedCards" JSONB NOT NULL DEFAULT '{}',
    "pinnedCards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visiblePills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "streakStartDate" TIMESTAMP(3),
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserHomePreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationalArticle" (
    "id" TEXT NOT NULL,
    "titleTr" TEXT NOT NULL,
    "titleEn" TEXT,
    "contentTr" TEXT NOT NULL,
    "contentEn" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageUrl" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationalArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserHomePreferences_userId_key" ON "UserHomePreferences"("userId");

-- CreateIndex
CREATE INDEX "UserHomePreferences_userId_idx" ON "UserHomePreferences"("userId");

-- CreateIndex
CREATE INDEX "EducationalArticle_category_publishedAt_idx" ON "EducationalArticle"("category", "publishedAt");

-- CreateIndex
CREATE INDEX "EducationalArticle_isActive_priority_idx" ON "EducationalArticle"("isActive", "priority");

-- AddForeignKey
ALTER TABLE "UserHomePreferences" ADD CONSTRAINT "UserHomePreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
