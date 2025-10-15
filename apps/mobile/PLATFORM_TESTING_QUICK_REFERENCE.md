# Platform Testing Quick Reference

## Quick Start Testing

### Start the App
```bash
# Terminal 1: Start backend
cd apps/api
npm run start:dev

# Terminal 2: Start mobile app
cd apps/mobile
npx expo start

# Then press:
# 'i' for iOS simulator
# 'a' for Android emulator
```

## Critical Test Scenarios

### 1. Basic Chat Flow (2 minutes)
```
1. Open Chat tab
2. Type "Merhaba NOVA" → Send
3. Wait for response (should stream)
4. Verify quota counter updates
5. Send 2-3 more messages
✅ Pass if: All messages display, streaming works, quota updates
```

### 2. Keyboard Behavior (1 minute)
```
iOS:
1. Tap input field
2. Verify keyboard slides up smoothly
3. Verify messages list adjusts
4. Type long text (100+ chars)
5. Verify input expands (max 100px height)
✅ Pass if: No content hidden, smooth animations

Android:
1. Tap input field
2. Verify keyboard slides up
3. Verify input field above keyboard
4. Press back button
5. Verify keyboard closes (doesn't exit screen)
✅ Pass if: Tab bar visible, keyboard dismisses correctly
```

### 3. Auto-Scroll (1 minute)
```
1. Send a message
2. Verify list scrolls to bottom automatically
3. Send another message during streaming
4. Verify list stays at bottom
5. Scroll up manually
6. Send message
7. Verify list scrolls to bottom again
✅ Pass if: Smooth scrolling, no jumping
```

### 4. Stop Streaming (30 seconds)
```
1. Send a message
2. Click "Durdur" button during streaming
3. Verify streaming stops immediately
4. Verify partial message removed
5. Verify input field available
✅ Pass if: Clean stop, no orphaned messages
```

### 5. Error Handling (2 minutes)
```
1. Turn off WiFi
2. Send message
3. Verify "Bağlantı Hatası" alert
4. Tap "Tekrar Dene"
5. Turn on WiFi
6. Verify message sends
✅ Pass if: Error message clear, retry works
```

### 6. Quota Display (1 minute)
```
1. Note current quota (e.g., "5/100")
2. Send message
3. Wait for response
4. Verify quota increments (e.g., "6/100")
5. Verify counter animates (scales up/down)
✅ Pass if: Counter updates, animation smooth
```

### 7. Forget Conversation (30 seconds)
```
1. Have 3+ messages
2. Tap "Sil" button
3. Verify confirmation alert
4. Tap "Sil"
5. Verify all messages cleared
6. Verify empty state shows
✅ Pass if: Messages deleted, clean state
```

## Platform Differences Checklist

| Feature | iOS | Android |
|---------|-----|---------|
| Keyboard behavior | `padding` | `height` |
| Keyboard offset | 0 | 90 |
| Shadow rendering | shadowColor/Offset | elevation |
| Back button | N/A | Dismisses keyboard |
| Alert style | iOS native | Android native |

## Common Issues & Fixes

### Issue: Keyboard covers input (Android)
**Fix**: Adjust `keyboardVerticalOffset` in KeyboardAvoidingView
```typescript
keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 90}
```

### Issue: Auto-scroll not working
**Fix**: Check FlatList ref and timing
```typescript
setTimeout(() => {
  flatListRef.current?.scrollToEnd({ animated: true });
}, 100);
```

### Issue: Messages not updating during streaming
**Fix**: Verify SSE client and state updates
```typescript
useEffect(() => {
  if (isStreaming && streamingContent) {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.isStreaming ? { ...msg, content: streamingContent } : msg
      )
    );
  }
}, [streamingContent, isStreaming]);
```

### Issue: Quota not updating
**Fix**: Ensure invalidateQueries called after streaming
```typescript
queryClient.invalidateQueries({ queryKey: ['quota'] });
```

## Performance Benchmarks

| Metric | Target | Acceptable |
|--------|--------|------------|
| First response | < 2s | < 5s |
| Streaming start | < 500ms | < 1s |
| Scroll FPS | 60 | 45+ |
| Keyboard animation | Native | Native |
| Memory usage | Stable | Stable |

## Test Result Template

```
Date: [DATE]
Tester: [NAME]
Device: [MODEL]
OS: [VERSION]

✅/❌ Basic chat flow
✅/❌ Keyboard behavior
✅/❌ Auto-scroll
✅/❌ Stop streaming
✅/❌ Error handling
✅/❌ Quota display
✅/❌ Forget conversation

Issues:
1. [Description]
2. [Description]

Overall: PASS/FAIL
```

## Emergency Debugging

### Check Backend Connection
```bash
# Test API endpoint
curl http://localhost:3000/health

# Check logs
cd apps/api
npm run start:dev
# Watch for errors
```

### Check Mobile Logs
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android

# Or use Expo
# Logs appear in terminal where you ran 'npx expo start'
```

### Reset Everything
```bash
# Clear Expo cache
cd apps/mobile
npx expo start -c

# Reset database (if needed)
cd apps/api
npx prisma migrate reset

# Restart everything
npm run dev
```

## Quick Verification Commands

```bash
# Verify implementation
node apps/mobile/verify-mobile-platform-implementation.js

# Should show: ✅ EXCELLENT: Implementation is complete and ready for testing!
```

## Contact for Issues

If you encounter issues during testing:
1. Check MOBILE_PLATFORM_TEST_GUIDE.md for detailed troubleshooting
2. Review TASK_16_MOBILE_PLATFORM_TEST_COMPLETE.md for implementation details
3. Check backend logs for API errors
4. Check mobile logs for client errors

---

**Last Updated**: 2025-10-15
**Task**: 16 - Mobile Platform Testing
**Status**: ✅ Ready for Testing
