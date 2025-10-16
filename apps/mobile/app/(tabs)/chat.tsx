import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { chatService, quotaService } from '@/services/api';
import { SSEClient } from '@/lib/sse';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import { usePremium, useQuota } from '@/hooks/usePremium';
import { UpgradePrompt } from '@/components/premium/UpgradePrompt';
import { QuotaExceededModal } from '@/components/premium/QuotaExceededModal';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  isStreaming?: boolean;
}

export default function ChatScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showQuotaExceeded, setShowQuotaExceeded] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const sseClient = useRef<SSEClient>(new SSEClient());
  const streamingContentRef = useRef('');
  const quotaAnimValue = useRef(new Animated.Value(1)).current;

  // Premium and quota hooks
  const { isPremium } = usePremium();
  const { quota, isDepleted, isLow, increment: incrementQuota } = useQuota();

  // Load or create conversation ID on mount
  useEffect(() => {
    const loadConversation = async () => {
      try {
        // Try to load existing conversation ID
        const savedConvId = await AsyncStorage.getItem('currentConversationId');

        if (savedConvId) {
          console.log('[Chat] Loading existing conversation:', savedConvId);
          setConversationId(savedConvId);

          // Load conversation history
          try {
            const history = await chatService.getHistory(savedConvId);
            if (history && history.messages) {
              const formattedMessages = history.messages.reverse().map((msg: any, index: number) => ({
                id: msg.id || `${msg.role}-${Date.now()}-${index}`,
                role: msg.role,
                content: msg.content,
                createdAt: msg.createdAt,
              }));
              setMessages(formattedMessages);
              console.log('[Chat] Loaded', formattedMessages.length, 'messages');
            }
          } catch (error) {
            console.log('[Chat] Could not load history:', error);
          }
        } else {
          // Create new conversation
          const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          console.log('[Chat] Creating new conversation:', newId);
          setConversationId(newId);
          await AsyncStorage.setItem('currentConversationId', newId);
        }
      } catch (error) {
        console.error('[Chat] Error loading conversation:', error);
        // Fallback to new conversation
        const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        setConversationId(newId);
      }
    };

    loadConversation();
  }, []);

  // Animate quota when it updates
  useEffect(() => {
    if (quota) {
      Animated.sequence([
        Animated.timing(quotaAnimValue, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(quotaAnimValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [quota]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return chatService.sendMessage(conversationId, content);
    },
    onSuccess: async (response: any) => {
      // Update conversation ID if backend created a new one
      const newConvId = response.conversationId;
      if (newConvId && newConvId !== conversationId) {
        console.log('[Chat] Updating conversation ID:', newConvId);
        setConversationId(newConvId);
        // Save to AsyncStorage
        await AsyncStorage.setItem('currentConversationId', newConvId);
      }
      // Wait a bit for the message to be committed to DB
      await new Promise(resolve => setTimeout(resolve, 100));
      // Use the new conversation ID for streaming
      startStreaming(newConvId || conversationId);
    },
    onError: (error: any) => {
      // Remove the user message that failed to send
      setMessages((prev) => prev.slice(0, -1));
      handleError(error);
    },
  });

  const handleError = (error: any) => {
    const errorMessage = error.message || 'Bir hata oluştu';

    // Check for specific error types
    if (errorMessage.includes('kota') || errorMessage.includes('quota')) {
      // Quota exceeded error - show upgrade prompt
      setShowUpgradePrompt(true);
    } else if (
      errorMessage.includes('network') ||
      errorMessage.includes('bağlantı') ||
      errorMessage.includes('internet') ||
      error.name === 'TypeError' ||
      error.name === 'NetworkError'
    ) {
      // Network error
      Alert.alert(
        'Bağlantı Hatası',
        'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Tekrar Dene',
            onPress: () => {
              // Retry the last message
              const lastUserMessage = messages.findLast(msg => msg.role === 'user');
              if (lastUserMessage) {
                sendMessageMutation.mutate(lastUserMessage.content);
              }
            },
          },
        ]
      );
    } else if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('zaman aşımı')
    ) {
      // Timeout error
      Alert.alert(
        'Zaman Aşımı',
        'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Tekrar Dene',
            onPress: () => {
              const lastUserMessage = messages.findLast(msg => msg.role === 'user');
              if (lastUserMessage) {
                sendMessageMutation.mutate(lastUserMessage.content);
              }
            },
          },
        ]
      );
    } else if (
      errorMessage.includes('rate limit') ||
      errorMessage.includes('yoğun')
    ) {
      // Rate limit error
      Alert.alert(
        'Sistem Yoğun',
        'Sistem şu anda yoğun. Lütfen birkaç saniye bekleyip tekrar deneyin.',
        [
          { text: 'Tamam', style: 'cancel' },
          {
            text: 'Tekrar Dene',
            onPress: () => {
              setTimeout(() => {
                const lastUserMessage = messages.findLast(msg => msg.role === 'user');
                if (lastUserMessage) {
                  sendMessageMutation.mutate(lastUserMessage.content);
                }
              }, 2000);
            },
          },
        ]
      );
    } else {
      // Generic error
      Alert.alert('Hata', errorMessage);
    }
  };

  const startStreaming = async (convId?: string) => {
    const activeConvId = convId || conversationId;
    console.log('[Chat] Starting stream for conversation:', activeConvId);

    setIsStreaming(true);
    setStreamingContent('');
    streamingContentRef.current = '';

    // Add temporary assistant message
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) throw new Error('No access token');

      const streamUrl = chatService.streamUrl(activeConvId);

      await sseClient.current.stream(streamUrl, token, {
        onToken: (chunk) => {
          console.log('[Chat] Token received:', chunk.substring(0, 50));
          streamingContentRef.current += chunk;
          setStreamingContent((prev) => prev + chunk);
        },
        onDone: async (data) => {
          console.log('[Chat] Stream done. Final content length:', streamingContentRef.current.length);
          setIsStreaming(false);
          // Replace temp message with final
          const finalContent = streamingContentRef.current;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempMessage.id
                ? {
                  ...msg,
                  content: finalContent,
                  isStreaming: false,
                }
                : msg
            )
          );
          setStreamingContent('');
          streamingContentRef.current = '';

          // Increment quota after successful message
          try {
            await incrementQuota();
            console.log('[Chat] Quota incremented successfully');
          } catch (error) {
            console.error('[Chat] Failed to increment quota:', error);
          }

          // Log for verification
          console.log('[Chat] Streaming completed, quota updated');
        },
        onError: (error) => {
          setIsStreaming(false);
          setStreamingContent('');
          streamingContentRef.current = '';
          setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
          handleError(error);
        },
      });
    } catch (error: any) {
      setIsStreaming(false);
      setStreamingContent('');
      streamingContentRef.current = '';
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      handleError(error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Check quota before sending (Requirements: 6.1, 6.2, 6.4, 6.5)
    if (isDepleted) {
      // Show quota exceeded modal
      setShowQuotaExceeded(true);
      return;
    }

    // Show warning if quota is low (Requirements: 6.3)
    if (isLow && !isPremium) {
      Alert.alert(
        'Mesaj Kotası Azalıyor',
        `Kalan mesaj kotanız: ${quota?.remaining || 0}. Premium'a geçerek sınırsız mesaj gönderin.`,
        [
          { text: 'Devam Et', style: 'default' },
          {
            text: 'Premium\'a Geç',
            onPress: () => router.push('/premium' as any),
          },
        ]
      );
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    sendMessageMutation.mutate(userMessage.content);
  };

  const handleStop = () => {
    sseClient.current.stop();
    setIsStreaming(false);
    setStreamingContent('');
    streamingContentRef.current = '';
    setMessages((prev) =>
      prev.filter((msg) => !msg.isStreaming).map((msg) => ({ ...msg, isStreaming: false }))
    );
  };

  const handleForget = () => {
    Alert.alert(
      'Sohbeti Sil',
      'Tüm mesajlar ve bu sohbete ait hafıza silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.forgetConversation(conversationId);
              setMessages([]);

              // Create new conversation
              const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
              setConversationId(newId);
              await AsyncStorage.setItem('currentConversationId', newId);

              Alert.alert('Başarılı', 'Sohbet silindi');
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Silinemedi');
            }
          },
        },
      ]
    );
  };

  // Update streaming message content
  useEffect(() => {
    if (isStreaming && streamingContent) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isStreaming ? { ...msg, content: streamingContent } : msg
        )
      );
    }
  }, [streamingContent, isStreaming]);

  const styles = createStyles(theme);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        {!isUser && (
          <Text style={styles.assistantLabel}>NOVA</Text>
        )}
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.content}
        </Text>
        {item.isStreaming && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header with quota */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>NOVA - AI Arkadaşın</Text>
            {quota ? (
              <Animated.View style={{ transform: [{ scale: quotaAnimValue }] }}>
                <TouchableOpacity
                  onPress={() => router.push('/settings' as any)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.quotaText,
                    isDepleted && styles.quotaTextDepleted,
                    isLow && !isDepleted && styles.quotaTextLow,
                  ]}>
                    {quota.used}/{quota.limit} mesaj
                    {isDepleted && ' ⚠️'}
                    {isLow && !isDepleted && ' ⚡'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ) : null}
          </View>
          <TouchableOpacity onPress={handleForget} style={styles.forgetButton}>
            <Text style={styles.forgetButtonText}>Sil</Text>
          </TouchableOpacity>
        </View>

        {/* Messages list */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && { flex: 1 }
          ]}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
          onLayout={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>👋 Merhaba!</Text>
              <Text style={styles.emptyStateText}>
                Ben NOVA, senin kişisel sağlık asistanınım. Regl döngün,
                hamilelik, su tüketimi veya genel sağlığınla ilgili her konuda
                yardımcı olabilirim.
              </Text>
              <Text style={styles.emptyStateText}>
                Bugün sana nasıl yardımcı olabilirim?
              </Text>
            </View>
          )}
        />

        {/* Input area - Fixed at bottom above tab bar */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom + 60, 12) }]}>
          {isStreaming ? (
            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
              <Text style={styles.stopButtonText}>⏹ Durdur</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Mesajınızı yazın..."
                placeholderTextColor={theme.colors.textLight}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || sendMessageMutation.isPending) &&
                  styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>↑</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="Sınırsız AI Mesajları"
        description="Mesaj kotanız doldu. Premium'a geçerek sınırsız mesaj gönderin ve gelişmiş AI özelliklerinden yararlanın."
      />

      {/* Quota Exceeded Modal */}
      <QuotaExceededModal
        visible={showQuotaExceeded}
        onClose={() => setShowQuotaExceeded(false)}
        quota={quota}
        isPremium={isPremium}
      />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  quotaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  quotaTextLow: {
    color: '#F59E0B', // Amber color for low quota warning
  },
  quotaTextDepleted: {
    color: theme.colors.error,
    fontWeight: '600',
  },
  forgetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.error,
  },
  forgetButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 140, // Space for input area + tab bar
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 14,
    shadowColor: theme.card.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 14,
    shadowColor: theme.card.shadowColor,
    shadowOffset: theme.card.shadowOffset,
    shadowOpacity: theme.card.shadowOpacity,
    shadowRadius: theme.card.shadowRadius,
    elevation: theme.card.elevation,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  assistantLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.text,
  },
  userMessageText: {
    color: theme.colors.textOnPrimary,
  },
  typingIndicator: {
    marginTop: 8,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 12,
    backgroundColor: theme.colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: theme.button.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.textLight,
  },
  sendButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  stopButton: {
    flex: 1,
    backgroundColor: theme.colors.error,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  stopButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyStateTitle: {
    fontSize: 32,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
});
