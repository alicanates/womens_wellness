# Q&A Community Components

Essential UI components for the Q&A Community feature.

## Components

### QuestionCard

Displays a question with author info, title, content preview, category, tags, and stats.

```tsx
import { QuestionCard } from '@/components/qna';

<QuestionCard
  question={question}
  onPress={() => router.push(`/community/${question.id}`)}
  showActions={true}
/>
```

**Props:**
- `question: Question` - Question data object
- `onPress: () => void` - Handler for card press
- `showActions?: boolean` - Show footer stats (default: true)

**Features:**
- Anonymous mode support
- Premium badge display
- Category pill
- Tag chips (max 3 visible)
- Answer count with status indicator
- View count
- Favorite count
- Relative timestamp

---

### AnswerCard

Displays an answer with voting, best answer badge, and comment support.

```tsx
import { AnswerCard } from '@/components/qna';

<AnswerCard
  answer={answer}
  isQuestionAuthor={isAuthor}
  onMarkBest={() => handleMarkBest(answer.id)}
  onVote={(voteType) => handleVote(answer.id, voteType)}
  onComment={() => handleComment(answer.id)}
/>
```

**Props:**
- `answer: Answer` - Answer data object
- `isQuestionAuthor: boolean` - Whether current user is question author
- `onMarkBest?: () => void` - Handler for marking as best answer
- `onVote: (type: VoteType) => void` - Handler for voting
- `onComment?: () => void` - Handler for commenting

**Features:**
- Best answer badge and styling
- Author info with reputation
- Vote button integration
- Comment count display
- Mark as best answer button (only for question author)

---

### VoteButton

Interactive voting component with upvote/downvote buttons.

```tsx
import { VoteButton } from '@/components/qna';

<VoteButton
  answerId={answer.id}
  currentVote={answer.userVote}
  voteCount={answer.voteCount}
  onVote={(voteType) => handleVote(voteType)}
/>
```

**Props:**
- `answerId: string` - Answer ID
- `currentVote: VoteType | null` - User's current vote
- `voteCount: number` - Total vote count
- `onVote: (type: VoteType) => void` - Handler for voting

**Features:**
- Upvote/downvote buttons
- Visual feedback for current vote
- Color-coded vote count (positive/negative)
- Optimistic UI updates

---

### CommentList

Displays a list of comments with loading and empty states.

```tsx
import { CommentList } from '@/components/qna';

<CommentList
  comments={comments}
  loading={isLoading}
  emptyMessage="Henüz yorum yok"
/>
```

**Props:**
- `comments: Comment[]` - Array of comments
- `loading?: boolean` - Loading state
- `emptyMessage?: string` - Message when no comments

**Features:**
- Author avatar and name
- Relative timestamps
- Loading indicator
- Empty state message
- Separator between comments

---

### CategoryPill

Displays a category badge with icon and label.

```tsx
import { CategoryPill } from '@/components/qna';

<CategoryPill
  category={QuestionCategory.PREGNANCY}
  size="medium"
/>
```

**Props:**
- `category: QuestionCategory` - Category enum value
- `size?: 'small' | 'medium'` - Size variant (default: 'medium')

**Features:**
- 12 predefined categories with icons and colors
- Small and medium size variants
- Color-coded backgrounds

**Categories:**
- MENSTRUAL_HEALTH - 🩸 Adet Sağlığı
- PREGNANCY - 🤰 Hamilelik
- FERTILITY - 🌸 Doğurganlık
- NUTRITION - 🥗 Beslenme
- EXERCISE - 💪 Egzersiz
- MENTAL_HEALTH - 🧠 Ruh Sağlığı
- SLEEP - 😴 Uyku
- CONTRACEPTION - 💊 Doğum Kontrolü
- PMS - 😣 PMS
- MENOPAUSE - 🌡️ Menopoz
- SEXUAL_HEALTH - ❤️ Cinsel Sağlık
- GENERAL - 💬 Genel

---

### TagChip

Displays a tag chip, optionally interactive.

```tsx
import { TagChip } from '@/components/qna';

// Static tag
<TagChip tag="hamilelik" />

// Interactive tag
<TagChip
  tag="hamilelik"
  onPress={() => handleTagPress('hamilelik')}
  selected={selectedTags.includes('hamilelik')}
  size="medium"
/>
```

**Props:**
- `tag: string` - Tag text
- `onPress?: () => void` - Handler for tag press (makes it interactive)
- `selected?: boolean` - Selected state (default: false)
- `size?: 'small' | 'medium'` - Size variant (default: 'medium')

**Features:**
- Hashtag prefix (#)
- Selected state styling
- Small and medium size variants
- Optional interactivity

---

### PopularQuestionsWidget

Displays a list of popular questions in a compact widget format.

```tsx
import { PopularQuestionsWidget } from '@/components/qna';

<PopularQuestionsWidget
  category={QuestionCategory.PREGNANCY}
  limit={5}
  showHeader={true}
  onSeeAll={() => router.push('/community/search?sort=popular')}
/>
```

**Props:**
- `category?: QuestionCategory` - Filter by category (optional)
- `limit?: number` - Number of questions to show (default: 5)
- `showHeader?: boolean` - Show widget header (default: true)
- `onSeeAll?: () => void` - Handler for "See All" button

**Features:**
- Compact question list with title and meta info
- Answer count and view count
- Answered status badge
- Loading state
- Auto-hides when no questions
- Chevron navigation indicator

---

### RelatedQuestions

Displays related questions based on category and tags.

```tsx
import { RelatedQuestions } from '@/components/qna';

<RelatedQuestions
  currentQuestionId={question.id}
  category={question.category}
  tags={question.tags}
  limit={5}
/>
```

**Props:**
- `currentQuestionId: string` - Current question ID (to exclude from results)
- `category: QuestionCategory` - Question category for matching
- `tags?: string[]` - Question tags for matching (uses first 3)
- `limit?: number` - Number of related questions (default: 5)

**Features:**
- Smart matching by category and tags
- Excludes current question
- Compact list format
- "See more in category" link
- Auto-hides when no related questions
- Loading state

---

## Usage Example

Complete example showing all components together:

```tsx
import { View, ScrollView } from 'react-native';
import {
  QuestionCard,
  AnswerCard,
  VoteButton,
  CommentList,
  CategoryPill,
  TagChip,
} from '@/components/qna';
import { useQna } from '@/hooks/useQna';

export default function QuestionDetailScreen() {
  const { question, answers, comments } = useQna();

  return (
    <ScrollView>
      {/* Question */}
      <QuestionCard
        question={question}
        onPress={() => {}}
        showActions={true}
      />

      {/* Answers */}
      {answers.map((answer) => (
        <AnswerCard
          key={answer.id}
          answer={answer}
          isQuestionAuthor={question.userId === currentUserId}
          onMarkBest={() => markBestAnswer(answer.id)}
          onVote={(type) => voteAnswer(answer.id, type)}
          onComment={() => openCommentModal(answer.id)}
        />
      ))}

      {/* Comments */}
      <CommentList
        comments={comments}
        loading={isLoadingComments}
      />

      {/* Category Filter */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <CategoryPill category={QuestionCategory.PREGNANCY} />
        <CategoryPill category={QuestionCategory.NUTRITION} />
      </View>

      {/* Tag Filter */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TagChip
          tag="hamilelik"
          onPress={() => filterByTag('hamilelik')}
          selected={true}
        />
        <TagChip tag="beslenme" />
      </View>
    </ScrollView>
  );
}
```

## Styling

All components use the theme system via `useTheme()` hook and follow the app's design patterns:

- Consistent spacing using `theme.spacing`
- Color palette from `theme.colors`
- Rounded corners (12-16px)
- Subtle shadows for depth
- Responsive to theme changes

## Performance

- All components are memoized with `React.memo`
- Optimized for list rendering
- Minimal re-renders
- Efficient timestamp formatting

## Accessibility

- Proper touch targets (minimum 44x44)
- Hit slop for small buttons
- Semantic color usage
- Clear visual hierarchy
