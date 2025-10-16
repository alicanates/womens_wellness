-- Performance optimization indexes for Discover section

-- Composite index for article queries (category + active status + priority)
-- This speeds up filtered queries on the articles list
CREATE INDEX IF NOT EXISTS "idx_articles_category_active_priority" 
ON "EducationalArticle"("category", "isActive", "priority" DESC);

-- Index for published date ordering
-- Helps with chronological sorting
CREATE INDEX IF NOT EXISTS "idx_articles_published_active" 
ON "EducationalArticle"("publishedAt" DESC, "isActive");

-- Index for expiration checks
-- Speeds up queries that filter by expiration date
CREATE INDEX IF NOT EXISTS "idx_articles_expires_active" 
ON "EducationalArticle"("expiresAt", "isActive") 
WHERE "expiresAt" IS NOT NULL;

-- Composite index for user saved articles
-- Optimizes saved articles queries with date sorting
CREATE INDEX IF NOT EXISTS "idx_interactions_user_saved_date" 
ON "ArticleInteraction"("userId", "saved", "savedAt" DESC) 
WHERE "saved" = true;

-- Index for article view tracking
-- Helps with analytics and personalization
CREATE INDEX IF NOT EXISTS "idx_interactions_article_viewed" 
ON "ArticleInteraction"("articleId", "viewed", "viewedAt" DESC) 
WHERE "viewed" = true;

-- Full-text search index for article titles (Turkish)
-- Enables fast text search on titles
CREATE INDEX IF NOT EXISTS "idx_articles_title_tr_search" 
ON "EducationalArticle" USING gin(to_tsvector('turkish', "titleTr"));

-- Full-text search index for article content (Turkish)
-- Enables fast text search on content
CREATE INDEX IF NOT EXISTS "idx_articles_content_tr_search" 
ON "EducationalArticle" USING gin(to_tsvector('turkish', "contentTr"));

-- Index for tags array search
-- Speeds up tag-based filtering
CREATE INDEX IF NOT EXISTS "idx_articles_tags" 
ON "EducationalArticle" USING gin("tags");

-- Index for user content preferences
-- Optimizes personalization queries
CREATE INDEX IF NOT EXISTS "idx_content_prefs_user" 
ON "UserContentPreferences"("userId");

-- Partial index for active articles only
-- Reduces index size and improves query performance
CREATE INDEX IF NOT EXISTS "idx_articles_active_only" 
ON "EducationalArticle"("priority" DESC, "publishedAt" DESC) 
WHERE "isActive" = true;