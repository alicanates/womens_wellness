# QnA Store Usage Examples

Bu dosya, QnA store'larının ve hook'larının nasıl kullanılacağını gösteren pratik örnekler içerir.

## 1. Question List Screen

```typescript
import { useQnaStore } from '@/store/qnaStore';
import { useQuestions } from '@/hooks/useQna';

function QuestionListScreen() {
  const { filters, setFilters, sortBy, setSortBy, getActiveFiltersCount } = useQnaStore();
  const activeFiltersCount = getActiveFiltersCount();

  const { data, isLoading, fetchNextPage, hasNextPage } = useQuestions(filters);

  return (
    <View>
      {/* Filter Badge */}
      {activeFiltersCount > 0 && (
        <Badge>{activeFiltersCount} filtre aktif</Badge>
      )}

      {/* Sort Buttons */}
      <View>
        <Button 
          onPress={() => setSortBy('recent')}
          variant={sortBy === 'recent' ? 'solid' : 'outline'}
        >
          En Yeni
        </Button>
        <Button 
          onPress={() => setSortBy('popular')}
          variant={sortBy === 'popular' ? 'solid' : 'outline'}
        >
          Popüler
        </Button>
      </View>

      {/* Category Filter */}
      <CategoryPicker
        value={filters.category}
        onChange={(category) => setFilters({ category })}
      />

      {/* Question List */}
      <FlatList
        data={data?.pages.flatMap(page => page.questions)}
        renderItem={({ item }) => <QuestionCard question={item} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
      />
    </View>
  );
}
```

## 2. Question Card with Interactions

```typescript
import { useQuestionFavorite, useQuestionFollow } from '@/hooks/useQnaInteractions';
import { useQnaInteractionsStore } from '@/store/qnaInteractionsStore';

function QuestionCard({ question }) {
  const { favorited, toggleFavorite, isLoading: isFavoriting } = useQuestionFavorite(question.id);
  const { following, toggleFollow, isLoading: isFollowing } = useQuestionFollow(question.id);
  const { isMyQuestion } = useQnaInteractionsStore();

  const isOwner = isMyQuestion(question.id);

  return (
    <Card>
      <Text>{question.title}</Text>
      
      {/* Show owner badge */}
      {isOwner && <Badge>Benim Sorum</Badge>}

      <View style={{ flexDirection: 'row' }}>
        {/* Favorite Button */}
        <IconButton
          icon={favorited ? 'heart' : 'heart-outline'}
          onPress={toggleFavorite}
          disabled={isFavoriting}
        />

        {/* Follow Button */}
        <IconButton
          icon={following ? 'bell' : 'bell-outline'}
          onPress={toggleFollow}
          disabled={isFollowing}
        />
      </View>
    </Card>
  );
}
```

## 3. Answer Card with Voting

```typescript
import { useAnswerVote } from '@/hooks/useQnaInteractions';
import { VoteType } from '@/types/qna';

function AnswerCard({ answer, isQuestionAuthor }) {
  const { 
    userVote, 
    vote, 
    isLoading, 
    optimisticVoteCount 
  } = useAnswerVote(answer.id, answer.voteCount);

  return (
    <Card>
      <Text>{answer.content}</Text>

      {/* Vote Buttons */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconButton
          icon="arrow-up"
          onPress={() => vote(VoteType.UPVOTE)}
          disabled={isLoading}
          color={userVote === VoteType.UPVOTE ? 'primary' : 'gray'}
        />
        
        <Text>{optimisticVoteCount}</Text>
        
        <IconButton
          icon="arrow-down"
          onPress={() => vote(VoteType.DOWNVOTE)}
          disabled={isLoading}
          color={userVote === VoteType.DOWNVOTE ? 'red' : 'gray'}
        />
      </View>

      {/* Best Answer Badge */}
      {answer.isBestAnswer && (
        <Badge color="success">En İyi Cevap</Badge>
      )}

      {/* Mark as Best Answer (only for question author) */}
      {isQuestionAuthor && !answer.isBestAnswer && (
        <Button onPress={() => markAsBestAnswer(answer.id)}>
          En İyi Cevap Olarak İşaretle
        </Button>
      )}
    </Card>
  );
}
```

## 4. Ask Question Screen with Draft

```typescript
import { useQnaStore } from '@/store/qnaStore';
import { useCreateQuestion } from '@/hooks/useQna';
import { useEffect } from 'react';

function AskQuestionScreen() {
  const { 
    draftQuestion, 
    setDraftQuestion, 
    clearDraftQuestion,
    showAnonymousMode,
    setShowAnonymousMode 
  } = useQnaStore();

  const createQuestion = useCreateQuestion();

  // Load draft on mount
  useEffect(() => {
    if (draftQuestion) {
      // Populate form with draft
      setTitle(draftQuestion.title);
      setContent(draftQuestion.content);
      setCategory(draftQuestion.category);
      setTags(draftQuestion.tags || []);
      setIsAnonymous(draftQuestion.isAnonymous || false);
    }
  }, []);

  const handleSubmit = async () => {
    try {
      await createQuestion.mutateAsync({
        title,
        content,
        category,
        tags,
        isAnonymous: showAnonymousMode,
      });

      // Clear draft on success
      clearDraftQuestion();
      
      // Navigate to question list
      router.push('/community');
    } catch (error) {
      // Keep draft on error
      console.error('Failed to create question:', error);
    }
  };

  const handleSaveDraft = () => {
    setDraftQuestion({
      title,
      content,
      category,
      tags,
      isAnonymous: showAnonymousMode,
    });
    
    Alert.alert('Taslak Kaydedildi', 'Sorunuz taslak olarak kaydedildi.');
  };

  return (
    <View>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Soru başlığı"
      />

      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Soru detayı"
        multiline
      />

      <CategoryPicker
        value={category}
        onChange={setCategory}
      />

      <TagInput
        value={tags}
        onChange={setTags}
      />

      {/* Anonymous Mode Toggle */}
      <Switch
        value={showAnonymousMode}
        onValueChange={setShowAnonymousMode}
      />
      <Text>Anonim olarak sor</Text>

      <Button onPress={handleSubmit}>
        Soruyu Gönder
      </Button>

      <Button onPress={handleSaveDraft} variant="outline">
        Taslak Olarak Kaydet
      </Button>
    </View>
  );
}
```

## 5. Notification Settings Screen

```typescript
import { useQnaNotificationPreferences, useQnaNotificationSummary } from '@/hooks/useQnaNotifications';

function NotificationSettingsScreen() {
  const {
    preferences,
    setNewAnswersEnabled,
    setAnswerVotesEnabled,
    setBestAnswerSelectedEnabled,
    setCommentsEnabled,
    setFollowedContentEnabled,
    setBadgesEarnedEnabled,
    setNotificationsEnabled,
    setQuietHoursEnabled,
    setQuietHours,
  } = useQnaNotificationPreferences();

  const { enabledCount, totalCount } = useQnaNotificationSummary();

  return (
    <ScrollView>
      {/* Master Toggle */}
      <ListItem>
        <Text>Bildirimleri Etkinleştir</Text>
        <Switch
          value={preferences.enabled}
          onValueChange={setNotificationsEnabled}
        />
      </ListItem>

      <Text>{enabledCount}/{totalCount} bildirim türü aktif</Text>

      {/* Individual Notification Types */}
      <Section title="Bildirim Türleri">
        <ListItem>
          <Text>Yeni Cevaplar</Text>
          <Switch
            value={preferences.newAnswers}
            onValueChange={setNewAnswersEnabled}
            disabled={!preferences.enabled}
          />
        </ListItem>

        <ListItem>
          <Text>Cevaba Oy Verildi</Text>
          <Switch
            value={preferences.answerVotes}
            onValueChange={setAnswerVotesEnabled}
            disabled={!preferences.enabled}
          />
        </ListItem>

        <ListItem>
          <Text>En İyi Cevap Seçildi</Text>
          <Switch
            value={preferences.bestAnswerSelected}
            onValueChange={setBestAnswerSelectedEnabled}
            disabled={!preferences.enabled}
          />
        </ListItem>

        <ListItem>
          <Text>Yorumlar</Text>
          <Switch
            value={preferences.comments}
            onValueChange={setCommentsEnabled}
            disabled={!preferences.enabled}
          />
        </ListItem>

        <ListItem>
          <Text>Takip Edilen İçerik</Text>
          <Switch
            value={preferences.followedContent}
            onValueChange={setFollowedContentEnabled}
            disabled={!preferences.enabled}
          />
        </ListItem>

        <ListItem>
          <Text>Rozet Kazanıldı</Text>
          <Switch
            value={preferences.badgesEarned}
            onValueChange={setBadgesEarnedEnabled}
            disabled={!preferences.enabled}
          />
        </ListItem>
      </Section>

      {/* Quiet Hours */}
      <Section title="Sessiz Saatler">
        <ListItem>
          <Text>Sessiz Saatleri Etkinleştir</Text>
          <Switch
            value={preferences.quietHoursEnabled}
            onValueChange={setQuietHoursEnabled}
            disabled={!preferences.enabled}
          />
        </ListItem>

        {preferences.quietHoursEnabled && (
          <>
            <TimePicker
              label="Başlangıç"
              value={preferences.quietHoursStart}
              onChange={(time) => setQuietHours(time, preferences.quietHoursEnd)}
            />
            <TimePicker
              label="Bitiş"
              value={preferences.quietHoursEnd}
              onChange={(time) => setQuietHours(preferences.quietHoursStart, time)}
            />
          </>
        )}
      </Section>
    </ScrollView>
  );
}
```

## 6. Notification Badge with Unread Count

```typescript
import { useQnaUnreadCount } from '@/hooks/useQnaNotifications';

function CommunityTabIcon() {
  const { unreadCount } = useQnaUnreadCount();

  return (
    <View>
      <Icon name="people" />
      {unreadCount > 0 && (
        <Badge style={{ position: 'absolute', top: -5, right: -5 }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </View>
  );
}
```

## 7. Notification Listener Setup

```typescript
import { useQnaNotificationListener, useQnaNotificationResponse } from '@/hooks/useQnaNotifications';
import { useRouter } from 'expo-router';
import { QnaNotificationType } from '@/store/qnaNotificationStore';

function App() {
  const router = useRouter();

  // Listen for incoming notifications
  useQnaNotificationListener();

  // Handle notification taps
  useQnaNotificationResponse((type, data) => {
    switch (type) {
      case QnaNotificationType.NEW_ANSWER:
        router.push(`/community/${data.questionId}`);
        break;
      case QnaNotificationType.BEST_ANSWER_SELECTED:
        router.push(`/community/${data.questionId}#answer-${data.answerId}`);
        break;
      case QnaNotificationType.BADGE_EARNED:
        router.push('/profile/badges');
        break;
      // ... other cases
    }
  });

  return <RootNavigator />;
}
```

## 8. Offline Support with Cache

```typescript
import { useQnaStore } from '@/store/qnaStore';
import { useQuestion } from '@/hooks/useQna';

function QuestionDetailScreen({ id }) {
  const { getCachedQuestion, cacheQuestion } = useQnaStore();

  // Try to get from cache first
  const cachedQuestion = getCachedQuestion(id);

  const { data: question, isLoading } = useQuestion(id, {
    // Use cached data as initial data
    initialData: cachedQuestion,
    onSuccess: (data) => {
      // Update cache with fresh data
      cacheQuestion(data);
    },
  });

  if (isLoading && !cachedQuestion) {
    return <LoadingSpinner />;
  }

  return (
    <View>
      {/* Show cached data immediately, then update when fresh data arrives */}
      <Text>{question?.title}</Text>
      <Text>{question?.content}</Text>
    </View>
  );
}
```

## 9. Logout Cleanup

```typescript
import { useAuthStore } from '@/store/authStore';
import { useQnaStore } from '@/store/qnaStore';
import { useQnaInteractionsStore } from '@/store/qnaInteractionsStore';
import { useQnaNotificationStore } from '@/store/qnaNotificationStore';

function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const clearQnaCache = useQnaStore((state) => state.clearCache);
  const clearInteractions = useQnaInteractionsStore((state) => state.clearAll);
  const clearUnreadCount = useQnaNotificationStore((state) => state.clearUnreadCount);

  return async () => {
    // Clear QnA stores
    clearQnaCache();
    clearInteractions();
    clearUnreadCount();

    // Clear auth
    await logout();

    // Navigate to login
    router.replace('/signin');
  };
}
```

## 10. Report Content

```typescript
import { useContentReport } from '@/hooks/useQnaInteractions';
import { ContentType } from '@/types/qna';

function ReportModal({ contentId, contentType, onClose }) {
  const { reported, report, isLoading } = useContentReport(contentId, contentType);

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  if (reported) {
    return (
      <View>
        <Text>Bu içerik zaten raporlandı</Text>
        <Button onPress={onClose}>Kapat</Button>
      </View>
    );
  }

  const handleSubmit = async () => {
    await report({ reason, description });
    Alert.alert('Başarılı', 'İçerik raporlandı');
    onClose();
  };

  return (
    <Modal>
      <Text>İçeriği Raporla</Text>

      <Picker
        value={reason}
        onValueChange={setReason}
      >
        <Picker.Item label="Spam" value="spam" />
        <Picker.Item label="Uygunsuz İçerik" value="inappropriate" />
        <Picker.Item label="Yanıltıcı Bilgi" value="misleading" />
        <Picker.Item label="Diğer" value="other" />
      </Picker>

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Açıklama (opsiyonel)"
        multiline
      />

      <Button onPress={handleSubmit} disabled={isLoading || !reason}>
        Raporla
      </Button>
    </Modal>
  );
}
```

## Best Practices Summary

1. **Optimistic Updates**: Store'ları UI'ı hızlı güncellemek için kullanın, API çağrısı başarısız olursa rollback yapın
2. **Selector Pattern**: Performans için sadece ihtiyaç duyulan state'i seçin
3. **Cache Strategy**: Offline support için önemli verileri cache'leyin
4. **Cleanup**: Logout'ta tüm store'ları temizleyin
5. **Persist**: Sadece gerekli state'i persist edin (AsyncStorage limiti)
6. **Type Safety**: TypeScript ile type-safe store kullanımı
7. **Notification Preferences**: Kullanıcı tercihlerini saklayın ve kontrol edin
8. **Error Handling**: Mutation'larda hata durumlarını yönetin
