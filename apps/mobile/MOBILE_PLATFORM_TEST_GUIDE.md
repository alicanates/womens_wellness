# Mobile Platform Testing Guide - Task 16

## Overview
This document provides a comprehensive testing guide for the chat functionality on iOS and Android platforms, including keyboard behavior and auto-scroll verification.

## Test Environment Setup

### Prerequisites
- iOS Simulator or physical iOS device (iOS 13+)
- Android Emulator or physical Android device (Android 8+)
- Expo Go app installed (for testing) or development build
- Backend API running and accessible
- Valid test user account

### Starting the App

```bash
# Start the mobile app
cd apps/mobile
npx expo start

# For iOS
# Press 'i' for iOS simulator or scan QR code with physical device

# For Android
# Press 'a' for Android emulator or scan QR code with physical device
```

## Test Cases

### 1. iOS Chat Flow Testing

#### 1.1 Basic Chat Functionality
- [ ] **Test**: Open chat screen
  - **Expected**: Screen loads with empty state message
  - **Verify**: "👋 Merhaba!" welcome message displays
  - **Verify**: Quota counter shows in header (e.g., "0/100 mesaj kullanıldı")

- [ ] **Test**: Send first message
  - **Action**: Type "Merhaba NOVA" and tap send button
  - **Expected**: 
    - User message appears on right side with blue background
    - Loading indicator appears for assistant response
    - Streaming response begins within 2-3 seconds
    - Assistant message appears on left side with white background
  - **Verify**: Quota counter increments (e.g., "1/100 mesaj kullanıldı")
  - **Verify**: Quota counter animates (scales up and down)

- [ ] **Test**: Send multiple messages
  - **Action**: Send 3-5 messages in sequence
  - **Expected**: All messages display correctly
  - **Verify**: Conversation history maintained
  - **Verify**: Quota counter updates after each response

- [ ] **Test**: Stop streaming
  - **Action**: Send a message, then tap "Durdur" button during streaming
  - **Expected**: Streaming stops immediately
  - **Verify**: Partial response is removed
  - **Verify**: Input field becomes available again

- [ ] **Test**: Forget conversation
  - **Action**: Tap "Sil" button in header
  - **Expected**: Confirmation alert appears
  - **Action**: Tap "Sil" in alert
  - **Expected**: All messages cleared
  - **Verify**: Empty state message reappears

#### 1.2 iOS Keyboard Behavior
- [ ] **Test**: Keyboard appearance
  - **Action**: Tap input field
  - **Expected**: 
    - Keyboard slides up smoothly
    - Input field moves up with keyboard
    - Messages list adjusts height
    - No content hidden behind keyboard
  - **Verify**: `KeyboardAvoidingView` with `behavior="padding"` working

- [ ] **Test**: Keyboard dismissal
  - **Action**: Tap outside input field or scroll messages
  - **Expected**: Keyboard dismisses smoothly
  - **Verify**: Layout returns to normal

- [ ] **Test**: Multiline input
  - **Action**: Type a long message (100+ characters)
  - **Expected**: 
    - Input field expands vertically (up to maxHeight: 100)
    - Text wraps properly
    - Send button remains aligned
  - **Verify**: Input doesn't exceed max height

- [ ] **Test**: Keyboard with messages
  - **Action**: Have 10+ messages, then tap input field
  - **Expected**: 
    - Keyboard appears
    - Messages list scrolls to show latest message
    - Input field visible above keyboard

#### 1.3 iOS Auto-Scroll Behavior
- [ ] **Test**: Auto-scroll on new message
  - **Action**: Send a message
  - **Expected**: 
    - List automatically scrolls to bottom
    - New user message visible
    - Smooth animation (100ms delay)
  - **Verify**: `flatListRef.current?.scrollToEnd({ animated: true })` working

- [ ] **Test**: Auto-scroll during streaming
  - **Action**: Send a message and watch streaming response
  - **Expected**: 
    - List stays at bottom during streaming
    - New tokens appear smoothly
    - No jumping or flickering

- [ ] **Test**: Manual scroll during streaming
  - **Action**: Send a message, scroll up during streaming
  - **Expected**: 
    - User can scroll up to read previous messages
    - Streaming continues at bottom
    - List doesn't auto-scroll while user is scrolling

- [ ] **Test**: Long conversation scroll
  - **Action**: Create 20+ messages
  - **Expected**: 
    - Can scroll through entire history
    - Smooth scrolling performance
    - Latest message always accessible

### 2. Android Chat Flow Testing

#### 2.1 Basic Chat Functionality
- [ ] **Test**: Open chat screen
  - **Expected**: Screen loads with empty state message
  - **Verify**: Welcome message displays correctly
  - **Verify**: Quota counter visible in header

- [ ] **Test**: Send first message
  - **Action**: Type "Merhaba NOVA" and tap send button
  - **Expected**: Same behavior as iOS
  - **Verify**: Message bubbles render correctly
  - **Verify**: Colors and shadows display properly

- [ ] **Test**: Send multiple messages
  - **Action**: Send 3-5 messages in sequence
  - **Expected**: All messages display correctly
  - **Verify**: No performance issues

- [ ] **Test**: Stop streaming
  - **Action**: Send message, tap "Durdur" during streaming
  - **Expected**: Streaming stops immediately
  - **Verify**: UI updates correctly

- [ ] **Test**: Forget conversation
  - **Action**: Tap "Sil" button
  - **Expected**: Alert dialog appears (Android style)
  - **Action**: Tap "Sil"
  - **Expected**: Messages cleared

#### 2.2 Android Keyboard Behavior
- [ ] **Test**: Keyboard appearance
  - **Action**: Tap input field
  - **Expected**: 
    - Keyboard slides up
    - Input field moves up
    - Messages list adjusts
    - No content hidden
  - **Verify**: `KeyboardAvoidingView` with `behavior="height"` working
  - **Verify**: `keyboardVerticalOffset={90}` accounts for tab bar

- [ ] **Test**: Keyboard dismissal
  - **Action**: Tap back button or outside input
  - **Expected**: Keyboard dismisses smoothly
  - **Verify**: Layout returns to normal

- [ ] **Test**: Multiline input
  - **Action**: Type long message
  - **Expected**: 
    - Input expands vertically
    - Text wraps properly
    - Max height respected

- [ ] **Test**: Keyboard with messages
  - **Action**: Have 10+ messages, tap input
  - **Expected**: 
    - Keyboard appears
    - Messages visible
    - Input field above keyboard

- [ ] **Test**: Android back button
  - **Action**: Open keyboard, press back button
  - **Expected**: Keyboard closes (doesn't exit screen)

#### 2.3 Android Auto-Scroll Behavior
- [ ] **Test**: Auto-scroll on new message
  - **Action**: Send a message
  - **Expected**: 
    - List scrolls to bottom automatically
    - Smooth animation
  - **Verify**: Same behavior as iOS

- [ ] **Test**: Auto-scroll during streaming
  - **Action**: Send message, watch streaming
  - **Expected**: 
    - List stays at bottom
    - Tokens appear smoothly
    - No performance issues

- [ ] **Test**: Manual scroll during streaming
  - **Action**: Send message, scroll up during streaming
  - **Expected**: 
    - Can scroll up
    - Streaming continues
    - No auto-scroll interference

- [ ] **Test**: Long conversation scroll
  - **Action**: Create 20+ messages
  - **Expected**: 
    - Smooth scrolling
    - No lag or stuttering
    - FlatList performance good

### 3. Cross-Platform Consistency

#### 3.1 Visual Consistency
- [ ] **Test**: Message bubbles
  - **Verify**: Same colors on both platforms
  - **Verify**: Same border radius and shadows
  - **Verify**: Same text size and spacing

- [ ] **Test**: Input field
  - **Verify**: Same styling on both platforms
  - **Verify**: Same placeholder text
  - **Verify**: Same max length (500 chars)

- [ ] **Test**: Buttons
  - **Verify**: Send button same size and color
  - **Verify**: Stop button same styling
  - **Verify**: Forget button same styling

#### 3.2 Functional Consistency
- [ ] **Test**: Streaming behavior
  - **Verify**: Same streaming speed on both platforms
  - **Verify**: Same token buffering (512 chars or 50ms)
  - **Verify**: Same error handling

- [ ] **Test**: Error messages
  - **Verify**: Same error alerts on both platforms
  - **Verify**: Same retry behavior
  - **Verify**: Same network error handling

### 4. Edge Cases and Error Scenarios

#### 4.1 Network Issues
- [ ] **Test**: Slow network
  - **Action**: Enable network throttling, send message
  - **Expected**: 
    - Loading indicator shows
    - Timeout after 30s
    - Error message displays
    - Retry option available

- [ ] **Test**: No network
  - **Action**: Disable network, send message
  - **Expected**: 
    - Network error alert appears
    - "Bağlantı Hatası" message
    - Retry option available

- [ ] **Test**: Network interruption during streaming
  - **Action**: Send message, disable network during streaming
  - **Expected**: 
    - Streaming stops
    - Error message displays
    - Partial message removed

#### 4.2 Quota Limits
- [ ] **Test**: Quota exceeded
  - **Action**: Use all quota, try to send message
  - **Expected**: 
    - Error alert appears
    - "Mesaj Kotası Doldu" message
    - Premium upgrade option shown
  - **Verify**: Quota counter shows "100/100 mesaj kullanıldı ⚠️"

#### 4.3 Long Messages
- [ ] **Test**: Max length input
  - **Action**: Type 500 characters
  - **Expected**: 
    - Input stops at 500 chars
    - Can still send message
    - Message displays correctly

- [ ] **Test**: Very long response
  - **Action**: Ask for detailed explanation
  - **Expected**: 
    - Long response streams correctly
    - Auto-scroll works
    - Message bubble wraps text properly

#### 4.4 Rapid Actions
- [ ] **Test**: Rapid message sending
  - **Action**: Send multiple messages quickly
  - **Expected**: 
    - Messages queue properly
    - No duplicate messages
    - Quota updates correctly

- [ ] **Test**: Rapid stop/start
  - **Action**: Send message, stop, send again quickly
  - **Expected**: 
    - No crashes
    - State updates correctly
    - No orphaned messages

### 5. Performance Testing

#### 5.1 Memory Usage
- [ ] **Test**: Long conversation
  - **Action**: Create 50+ messages
  - **Expected**: 
    - No memory leaks
    - App remains responsive
    - Scrolling smooth

#### 5.2 Rendering Performance
- [ ] **Test**: Fast streaming
  - **Action**: Send message, observe streaming
  - **Expected**: 
    - No frame drops
    - Smooth text rendering
    - No UI lag

- [ ] **Test**: Keyboard animation
  - **Action**: Open/close keyboard repeatedly
  - **Expected**: 
    - Smooth animations
    - No layout jumps
    - No flickering

## Test Results Template

### iOS Test Results

**Device**: [iPhone model / iOS version]
**Date**: [Test date]
**Tester**: [Name]

| Test Case | Status | Notes |
|-----------|--------|-------|
| Basic chat flow | ✅/❌ | |
| Keyboard behavior | ✅/❌ | |
| Auto-scroll | ✅/❌ | |
| Error handling | ✅/❌ | |
| Performance | ✅/❌ | |

**Issues Found**:
1. [Issue description]
2. [Issue description]

### Android Test Results

**Device**: [Android model / Android version]
**Date**: [Test date]
**Tester**: [Name]

| Test Case | Status | Notes |
|-----------|--------|-------|
| Basic chat flow | ✅/❌ | |
| Keyboard behavior | ✅/❌ | |
| Auto-scroll | ✅/❌ | |
| Error handling | ✅/❌ | |
| Performance | ✅/❌ | |

**Issues Found**:
1. [Issue description]
2. [Issue description]

## Known Platform Differences

### iOS
- Uses `behavior="padding"` for KeyboardAvoidingView
- No vertical offset needed (keyboardVerticalOffset={0})
- Native keyboard animations
- Shadow rendering uses shadowColor, shadowOffset, etc.

### Android
- Uses `behavior="height"` for KeyboardAvoidingView
- Requires vertical offset for tab bar (keyboardVerticalOffset={90})
- Different keyboard behavior (back button dismisses)
- Shadow rendering uses elevation

## Troubleshooting

### Issue: Keyboard covers input on Android
**Solution**: Adjust `keyboardVerticalOffset` value in KeyboardAvoidingView

### Issue: Auto-scroll not working
**Solution**: Check FlatList ref and scrollToEnd timing (100ms delay)

### Issue: Messages not updating during streaming
**Solution**: Verify SSE client buffer settings and state updates

### Issue: Quota not updating
**Solution**: Check queryClient.invalidateQueries after streaming completes

## Conclusion

After completing all test cases, verify:
- ✅ Chat flow works on both iOS and Android
- ✅ Keyboard behavior is correct on both platforms
- ✅ Auto-scroll functions properly
- ✅ Error handling works consistently
- ✅ Performance is acceptable
- ✅ No critical bugs found

**Task 16 Status**: [PASS/FAIL]
