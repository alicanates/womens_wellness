# Design Document

## Overview

Keşfet bölümü, kullanıcılara kişiselleştirilmiş eğitim içerikleri sunmak için tasarlanmış kapsamlı bir sistemdir. Bu sistem, backend'de akıllı içerik önerisi motoru, veritabanında esnek içerik yönetimi ve frontend'de zengin kullanıcı deneyimi sağlar.

Sistem üç ana bileşenden oluşur:
1. **Backend API**: İçerik yönetimi, öneri motoru ve kullanıcı etkileşim takibi
2. **Mobile UI**: Anasayfa entegrasyonu, keşfet sayfası ve makale detay görünümü
3. **Database**: İçerik, kullanıcı tercihleri ve etkileşim verileri

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Home Screen  │  │Discover Page │  │Article Detail│      │
│  │  (Enhanced)  │  │   (New)      │  │   (New)      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Discover       │                        │
│                   │  Service        │                        │
│                   │  (API Client)   │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   REST API      │
                    │   (NestJS)      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   Discover     │  │  Recommendation │  │   User         │
│   Controller   │  │  Engine         │  │   Interaction  │
└───────┬────────┘  └────────┬────────┘  └───────┬────────┘
        │                    │                    │
        └────────────────────┴────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   (Prisma)      │
                    └─────────────────┘
```

### Component Interaction Flow

```
User Action → Mobile Component → API Service → Controller → Service Layer → Database
                                                                    ↓
                                                            Recommendation Engine
                                                                    ↓
                                                            Personalization Logic
```

## Components and Interfaces

### 1. Database Schema (Prisma)

#### EducationalArticle Model
```prisma
model EducationalArticle {
  id            String    @id @default(cuid())
  
  // Content (Multi-language)
  titleTr       String
  titleEn       String?
  contentTr     String    @db.Text
  contentEn     String?   @db.Text
  excerpt       String?   @db.Text // Short summary for cards
  
  // Categorization
  category      String    // 'menstrual_health', 'pregnancy', 'nutrition', etc.
  tags          String[]  // ['hydration', 'exercise', 'mental_health']
  
  // Media
  imageUrl      String?
  thumbnailUrl  String?
  
  // Metadata
  author        String?
  readTimeMin   Int       @default(5) // Estimated reading time
  priority      Int       @default(0) // Higher = more important
  
  // Lifecycle
  isActive      Boolean   @default(true)
  publishedAt   DateTime  @default(now())
  expiresAt     DateTime? // Optional expiration
  
  // Relations
  interactions  ArticleInteraction[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([category, isActive, priority])
  @@index([publishedAt])
}
```

#### ArticleInteraction Model
```prisma
model ArticleInteraction {
  id          String   @id @default(cuid())
  userId      String
  articleId   String
  
  // Interaction types
  viewed      Boolean  @default(false)
  saved       Boolean  @default(false)
  shared      Boolean  @default(false)
  
  // Engagement metrics
  viewedAt    DateTime?
  savedAt     DateTime?
  sharedAt    DateTime?
  readTimeMs  Int?     // Actual time spent reading
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  article     EducationalArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([userId, articleId])
  @@index([userId, saved])
  @@index([articleId])
}
```

#### UserContentPreferences Model
```prisma
model UserContentPreferences {
  id                String   @id @default(cuid())
  userId            String   @unique
  
  // Preferred categories (weighted)
  categoryWeights   Json     @default("{}") // { "pregnancy": 0.8, "nutrition": 0.6 }
  
  // Interaction history summary
  totalArticlesRead Int      @default(0)
  favoriteCategories String[] @default([])
  
  // Personalization settings
  showPregnancyContent Boolean @default(false)
  showCycleContent     Boolean @default(true)
  
  // Relations
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### 2. Backend API

#### Discover Controller
```typescript
@Controller('discover')
@UseGuards(AuthGuard('jwt'))
export class DiscoverController {
  
  // Get personalized articles for home screen
  @Get('home-feed')
  async getHomeFeed(
    @Request() req,
    @Query('locale') locale: string = 'tr',
    @Query('limit') limit: number = 5
  ): Promise<ArticleCardDto[]>
  
  // Get all articles with filters
  @Get('articles')
  async getArticles(
    @Request() req,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('locale') locale: string = 'tr',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ): Promise<PaginatedArticlesDto>
  
  // Get single article detail
  @Get('articles/:id')
  async getArticle(
    @Request() req,
    @Param('id') id: string,
    @Query('locale') locale: string = 'tr'
  ): Promise<ArticleDetailDto>
  
  // Get saved articles
  @Get('saved')
  async getSavedArticles(
    @Request() req,
    @Query('locale') locale: string = 'tr'
  ): Promise<ArticleCardDto[]>
  
  // Save/unsave article
  @Post('articles/:id/save')
  async toggleSaveArticle(
    @Request() req,
    @Param('id') id: string
  ): Promise<{ saved: boolean }>
  
  // Track article view
  @Post('articles/:id/view')
  async trackView(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { readTimeMs?: number }
  ): Promise<{ success: boolean }>
  
  // Track article share
  @Post('articles/:id/share')
  async trackShare(
    @Request() req,
    @Param('id') id: string
  ): Promise<{ success: boolean }>
  
  // Get user preferences
  @Get('preferences')
  async getPreferences(
    @Request() req
  ): Promise<UserContentPreferencesDto>
  
  // Update user preferences
  @Patch('preferences')
  async updatePreferences(
    @Request() req,
    @Body() body: UpdatePreferencesDto
  ): Promise<UserContentPreferencesDto>
}
```

#### Discover Service
```typescript
@Injectable()
export class DiscoverService {
  constructor(
    private prisma: PrismaService,
    private recommendationEngine: RecommendationEngine,
    private cyclesService: CyclesService,
    private pregnancyService: PregnancyService
  ) {}
  
  // Get personalized feed for home screen
  async getHomeFeed(
    userId: string,
    locale: string,
    limit: number
  ): Promise<ArticleCardDto[]> {
    // 1. Get user context (cycle, pregnancy, preferences)
    // 2. Get recommendation scores from engine
    // 3. Fetch top articles
    // 4. Include interaction status (saved, viewed)
    // 5. Return formatted cards
  }
  
  // Get articles with filters
  async getArticles(
    userId: string,
    filters: ArticleFilters,
    locale: string,
    pagination: Pagination
  ): Promise<PaginatedArticlesDto> {
    // 1. Build query with filters
    // 2. Apply search if provided
    // 3. Include interaction status
    // 4. Return paginated results
  }
  
  // Get article detail
  async getArticle(
    userId: string,
    articleId: string,
    locale: string
  ): Promise<ArticleDetailDto> {
    // 1. Fetch article
    // 2. Get interaction status
    // 3. Get related articles
    // 4. Return full detail
  }
  
  // Toggle save status
  async toggleSaveArticle(
    userId: string,
    articleId: string
  ): Promise<boolean> {
    // 1. Check current status
    // 2. Toggle saved flag
    // 3. Update preferences weights
    // 4. Return new status
  }
  
  // Track article view
  async trackView(
    userId: string,
    articleId: string,
    readTimeMs?: number
  ): Promise<void> {
    // 1. Create or update interaction
    // 2. Update view metrics
    // 3. Update user preferences
  }
  
  // Track article share
  async trackShare(
    userId: string,
    articleId: string
  ): Promise<void> {
    // 1. Update interaction
    // 2. Increment share count
  }
}
```

#### Recommendation Engine
```typescript
@Injectable()
export class RecommendationEngine {
  
  // Calculate personalized scores for articles
  async calculateScores(
    userId: string,
    articles: EducationalArticle[]
  ): Promise<Map<string, number>> {
    // Scoring factors:
    // 1. User cycle phase relevance (30%)
    // 2. Pregnancy week relevance (40% if pregnant)
    // 3. Category preferences (20%)
    // 4. Reading history similarity (10%)
    // 5. Seasonal relevance (5%)
    // 6. Recency boost (5%)
  }
  
  // Get cycle-relevant categories
  private getCycleRelevantCategories(
    cycleDay: number
  ): string[] {
    // Days 1-5: menstrual_health, pain_management
    // Days 6-13: nutrition, exercise
    // Days 14-16: fertility, ovulation
    // Days 17-28: pms, mood_management
  }
  
  // Get pregnancy-relevant categories
  private getPregnancyRelevantCategories(
    week: number
  ): string[] {
    // Trimester-based categories
    // Week-specific content
  }
  
  // Calculate category weight
  private calculateCategoryWeight(
    category: string,
    userPreferences: UserContentPreferences
  ): number {
    // Use stored weights or default
  }
  
  // Get seasonal boost
  private getSeasonalBoost(
    tags: string[],
    currentMonth: number
  ): number {
    // Summer: hydration, sun_protection
    // Winter: immunity, vitamin_d
  }
}
```

### 3. Mobile Components

#### Enhanced Home Screen
```typescript
// apps/mobile/app/(tabs)/home.tsx
// Add to existing home screen

{/* Zone D: Educational Articles (Enhanced) */}
{snapshot?.educationalArticles && snapshot.educationalArticles.length > 0 && (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Keşfet</Text>
      <TouchableOpacity onPress={() => router.push('/discover')}>
        <Text style={styles.seeAllText}>Tümünü Gör</Text>
      </TouchableOpacity>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.articlesContainer}
    >
      {snapshot.educationalArticles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onPress={() => router.push(`/discover/article/${article.id}`)}
          onSave={() => handleSaveArticle(article.id)}
        />
      ))}
    </ScrollView>
  </View>
)}
```

#### ArticleCard Component
```typescript
// apps/mobile/src/components/discover/ArticleCard.tsx

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    imageUrl?: string;
    readTimeMin: number;
    isSaved: boolean;
  };
  onPress: () => void;
  onSave: () => void;
  variant?: 'horizontal' | 'vertical';
}

export function ArticleCard({ article, onPress, onSave, variant = 'vertical' }: ArticleCardProps) {
  // Render card with:
  // - Image (if available)
  // - Category badge
  // - Title
  // - Excerpt (2 lines max)
  // - Read time
  // - Save button (heart icon)
}
```

#### Discover Page
```typescript
// apps/mobile/app/discover.tsx

export default function DiscoverScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tabs: All | Saved
  // Category filters (horizontal scroll)
  // Search bar
  // Article list (vertical scroll with pagination)
  
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Text style={styles.title}>Keşfet</Text>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </View>
      
      <View style={styles.tabs}>
        <Tab active={activeTab === 'all'} onPress={() => setActiveTab('all')}>
          Tümü
        </Tab>
        <Tab active={activeTab === 'saved'} onPress={() => setActiveTab('saved')}>
          Kaydedilenler
        </Tab>
      </View>
      
      {activeTab === 'all' && (
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}
      
      <ArticleList
        articles={articles}
        onArticlePress={handleArticlePress}
        onSavePress={handleSavePress}
      />
    </SafeAreaView>
  );
}
```

#### Article Detail Page
```typescript
// apps/mobile/app/discover/article/[id].tsx

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams();
  const [readStartTime] = useState(Date.now());
  
  // Track view on mount
  useEffect(() => {
    trackView(id);
    
    return () => {
      // Track read time on unmount
      const readTime = Date.now() - readStartTime;
      trackReadTime(id, readTime);
    };
  }, [id]);
  
  return (
    <ScrollView>
      {/* Hero Image */}
      {article.imageUrl && (
        <Image source={{ uri: article.imageUrl }} style={styles.heroImage} />
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <CategoryBadge category={article.category} />
        <Text style={styles.readTime}>{article.readTimeMin} dk okuma</Text>
      </View>
      
      {/* Title */}
      <Text style={styles.title}>{article.title}</Text>
      
      {/* Meta */}
      <View style={styles.meta}>
        <Text style={styles.author}>{article.author}</Text>
        <Text style={styles.date}>
          {formatDate(article.publishedAt)}
        </Text>
      </View>
      
      {/* Content */}
      <Markdown style={markdownStyles}>
        {article.content}
      </Markdown>
      
      {/* Tags */}
      <View style={styles.tags}>
        {article.tags.map(tag => (
          <TagChip key={tag} label={tag} />
        ))}
      </View>
      
      {/* Actions */}
      <View style={styles.actions}>
        <ActionButton
          icon={article.isSaved ? 'heart-filled' : 'heart-outline'}
          label={article.isSaved ? 'Kaydedildi' : 'Kaydet'}
          onPress={handleSave}
        />
        <ActionButton
          icon="share"
          label="Paylaş"
          onPress={handleShare}
        />
      </View>
      
      {/* Related Articles */}
      <View style={styles.related}>
        <Text style={styles.relatedTitle}>İlgini Çekebilir</Text>
        {relatedArticles.map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="horizontal"
            onPress={() => router.push(`/discover/article/${article.id}`)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
```

### 4. API Service Client

```typescript
// apps/mobile/src/services/api.ts

export const discoverService = {
  // Get home feed
  getHomeFeed: (locale: string = 'tr', limit: number = 5) =>
    api.get<ArticleCardDto[]>(`/discover/home-feed?locale=${locale}&limit=${limit}`),
  
  // Get all articles
  getArticles: (params: {
    category?: string;
    search?: string;
    locale?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.get<PaginatedArticlesDto>(`/discover/articles?${query}`);
  },
  
  // Get article detail
  getArticle: (id: string, locale: string = 'tr') =>
    api.get<ArticleDetailDto>(`/discover/articles/${id}?locale=${locale}`),
  
  // Get saved articles
  getSavedArticles: (locale: string = 'tr') =>
    api.get<ArticleCardDto[]>(`/discover/saved?locale=${locale}`),
  
  // Toggle save
  toggleSave: (id: string) =>
    api.post<{ saved: boolean }>(`/discover/articles/${id}/save`),
  
  // Track view
  trackView: (id: string, readTimeMs?: number) =>
    api.post(`/discover/articles/${id}/view`, { readTimeMs }),
  
  // Track share
  trackShare: (id: string) =>
    api.post(`/discover/articles/${id}/share`),
  
  // Get preferences
  getPreferences: () =>
    api.get<UserContentPreferencesDto>('/discover/preferences'),
  
  // Update preferences
  updatePreferences: (data: UpdatePreferencesDto) =>
    api.patch<UserContentPreferencesDto>('/discover/preferences', data),
};
```

## Data Models

### DTOs

```typescript
// Article Card DTO (for lists)
interface ArticleCardDto {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
  readTimeMin: number;
  publishedAt: string;
  isSaved: boolean;
  isViewed: boolean;
}

// Article Detail DTO
interface ArticleDetailDto extends ArticleCardDto {
  content: string;
  author?: string;
  relatedArticles: ArticleCardDto[];
}

// Paginated Articles DTO
interface PaginatedArticlesDto {
  articles: ArticleCardDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// User Content Preferences DTO
interface UserContentPreferencesDto {
  categoryWeights: Record<string, number>;
  favoriteCategories: string[];
  showPregnancyContent: boolean;
  showCycleContent: boolean;
}

// Update Preferences DTO
interface UpdatePreferencesDto {
  categoryWeights?: Record<string, number>;
  showPregnancyContent?: boolean;
  showCycleContent?: boolean;
}
```

### Categories

```typescript
const ARTICLE_CATEGORIES = {
  menstrual_health: 'Regl Sağlığı',
  pregnancy: 'Hamilelik',
  fertility: 'Doğurganlık',
  nutrition: 'Beslenme',
  exercise: 'Egzersiz',
  mental_health: 'Mental Sağlık',
  sleep: 'Uyku',
  hydration: 'Hidrasyon',
  contraception: 'Doğum Kontrolü',
  pms: 'PMS',
  menopause: 'Menopoz',
  sexual_health: 'Cinsel Sağlık',
} as const;
```

## Error Handling

### API Errors
```typescript
// Standard error responses
{
  statusCode: number;
  message: string;
  error?: string;
}

// Common error codes:
// 404: Article not found
// 400: Invalid parameters
// 401: Unauthorized
// 500: Server error
```

### Mobile Error Handling
```typescript
// Use React Query error handling
const { data, error, isError } = useQuery({
  queryKey: ['article', id],
  queryFn: () => discoverService.getArticle(id),
  retry: 2,
  onError: (error) => {
    Alert.alert('Hata', 'Makale yüklenemedi. Lütfen tekrar deneyin.');
  },
});

// Offline support
// - Cache articles for offline reading
// - Queue interactions (save, view) for sync
```

## Testing Strategy

### Unit Tests

#### Backend
```typescript
describe('DiscoverService', () => {
  describe('getHomeFeed', () => {
    it('should return personalized articles based on cycle day');
    it('should prioritize pregnancy content when user is pregnant');
    it('should respect user category preferences');
    it('should exclude viewed articles from recent feed');
  });
  
  describe('RecommendationEngine', () => {
    it('should calculate correct scores for cycle-relevant content');
    it('should apply seasonal boost correctly');
    it('should weight categories based on user history');
  });
});
```

#### Frontend
```typescript
describe('ArticleCard', () => {
  it('should render article information correctly');
  it('should show saved state correctly');
  it('should call onPress when tapped');
  it('should call onSave when save button tapped');
});

describe('DiscoverScreen', () => {
  it('should switch between tabs correctly');
  it('should filter by category');
  it('should search articles');
  it('should load more on scroll');
});
```

### Integration Tests

```typescript
describe('Discover Flow', () => {
  it('should load personalized feed on home screen');
  it('should navigate to discover page');
  it('should save and unsave articles');
  it('should track article views');
  it('should share articles');
});
```

### E2E Tests

```typescript
describe('Article Discovery Journey', () => {
  it('user can browse articles from home');
  it('user can search for specific topics');
  it('user can save articles for later');
  it('user can read full article');
  it('user can share article');
});
```

## Performance Considerations

### Backend Optimization
- **Caching**: Cache article lists with Redis (5 min TTL)
- **Indexing**: Database indexes on category, priority, publishedAt
- **Pagination**: Limit results to 20 per page
- **Eager Loading**: Include interactions in article queries

### Frontend Optimization
- **Image Optimization**: Use thumbnails for cards, full images for detail
- **Lazy Loading**: Implement infinite scroll with pagination
- **Caching**: React Query caching with 5 min stale time
- **Prefetching**: Prefetch article detail on card press

### Database Optimization
```sql
-- Indexes for common queries
CREATE INDEX idx_articles_category_active ON educational_articles(category, is_active, priority DESC);
CREATE INDEX idx_articles_published ON educational_articles(published_at DESC);
CREATE INDEX idx_interactions_user_saved ON article_interactions(user_id, saved);
```

## Security Considerations

- **Authentication**: All endpoints require JWT authentication
- **Authorization**: Users can only access their own interactions
- **Input Validation**: Validate all query parameters and body data
- **Rate Limiting**: Limit API calls to prevent abuse
- **Content Sanitization**: Sanitize article content before storage
- **XSS Prevention**: Use markdown renderer with XSS protection

## Accessibility

- **Screen Reader Support**: Proper labels for all interactive elements
- **Keyboard Navigation**: Support for keyboard navigation on web
- **Color Contrast**: WCAG AA compliant color contrast
- **Font Scaling**: Support for system font scaling
- **Alternative Text**: Alt text for all images

## Localization

- **Multi-language Support**: TR and EN content
- **Fallback Logic**: Fall back to TR if EN not available
- **Date Formatting**: Locale-aware date formatting
- **Number Formatting**: Locale-aware number formatting

## Future Enhancements

1. **Video Content**: Support for video articles
2. **Audio Articles**: Text-to-speech for articles
3. **Bookmarks**: Highlight and bookmark specific sections
4. **Notes**: User notes on articles
5. **Collections**: User-created article collections
6. **Social Features**: Like, comment, and discuss articles
7. **Push Notifications**: Notify users of new relevant content
8. **Offline Mode**: Full offline reading support
9. **AI Summaries**: AI-generated article summaries
10. **Personalized Newsletters**: Weekly digest of recommended articles
