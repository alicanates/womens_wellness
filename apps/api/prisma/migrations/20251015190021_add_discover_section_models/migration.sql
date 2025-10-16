-- DropIndex
DROP INDEX "EducationalArticle_category_publishedAt_idx";

-- DropIndex
DROP INDEX "EducationalArticle_isActive_priority_idx";

-- AlterTable
ALTER TABLE "EducationalArticle" ADD COLUMN     "author" TEXT,
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "readTimeMin" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "thumbnailUrl" TEXT;

-- CreateTable
CREATE TABLE "ArticleInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "savedAt" TIMESTAMP(3),
    "sharedAt" TIMESTAMP(3),
    "readTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserContentPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryWeights" JSONB NOT NULL DEFAULT '{}',
    "totalArticlesRead" INTEGER NOT NULL DEFAULT 0,
    "favoriteCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "showPregnancyContent" BOOLEAN NOT NULL DEFAULT false,
    "showCycleContent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserContentPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArticleInteraction_userId_saved_idx" ON "ArticleInteraction"("userId", "saved");

-- CreateIndex
CREATE INDEX "ArticleInteraction_articleId_idx" ON "ArticleInteraction"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleInteraction_userId_articleId_key" ON "ArticleInteraction"("userId", "articleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserContentPreferences_userId_key" ON "UserContentPreferences"("userId");

-- CreateIndex
CREATE INDEX "EducationalArticle_category_isActive_priority_idx" ON "EducationalArticle"("category", "isActive", "priority");

-- CreateIndex
CREATE INDEX "EducationalArticle_publishedAt_idx" ON "EducationalArticle"("publishedAt");

-- AddForeignKey
ALTER TABLE "ArticleInteraction" ADD CONSTRAINT "ArticleInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleInteraction" ADD CONSTRAINT "ArticleInteraction_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "EducationalArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContentPreferences" ADD CONSTRAINT "UserContentPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
