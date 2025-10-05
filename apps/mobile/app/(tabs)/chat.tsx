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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { chatService, quotaService } from '@/services/api';
import { SSEClient } from '@/lib/sse';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@/hooks/useTheme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  isStreaming?: boolean;
}

export default function ChatScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const sseClient = useRef<SSEClient>(new SSEClient());
  const streamingContentRef = useRef('');

  // Generate conversation ID on mount
  useEffect(() => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setConversationId(id);
  }, []);

  // Fetch quota status
  const { data: quotaData } = useQuery({
    queryKey: ['quota'],
    queryFn: () => quotaService.getStatus(),
    refetchInterval: 30000, // Refresh every 30s
    enabled: isAuthenticated,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return chatService.sendMessage(conversationId, content);
    },
    onSuccess: () => {
      startStreaming();
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Mesaj gönderilemedi');
    },
  });

  const startStreaming = async () => {
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

      const streamUrl = chatService.streamUrl(conversationId);

      await sseClient.current.stream(streamUrl, token, {
        onToken: (chunk) => {
          streamingContentRef.current += chunk;
          setStreamingContent((prev) => prev + chunk);
        },
        onDone: (data) => {
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
          // Refresh quota
          queryClient.invalidateQueries({ queryKey: ['quota'] });
        },
        onError: (error) => {
          setIsStreaming(false);
          setStreamingContent('');
          streamingContentRef.current = '';
          setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
          Alert.alert('Hata', error.message || 'Yanıt alınamadı');
        },
      });
    } catch (error: any) {
      setIsStreaming(false);
      setStreamingContent('');
      streamingContentRef.current = '';
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      Alert.alert('Hata', error.message || 'Bağlantı hatası');
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

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

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 90}
      >
      {/* Header with quota */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>NOVA - AI Arkadaşın</Text>
          {quotaData ? (
            <Text style={styles.quotaText}>
              {(quotaData as any).used}/{(quotaData as any).limit} mesaj kullanıldı
            </Text>
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
        contentContainerStyle={styles.messagesList}
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

      {/* Input area */}
      <View style={styles.inputContainer}>
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
    </SafeAreaView>
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
    paddingBottom: 100, // Extra padding for bottom tab bar
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
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
