# Chat Error Handling Testing Guide

## Overview
This guide provides instructions for testing the improved error handling in the Chat Screen.

## Test Scenarios

### 1. Quota Exceeded Error

**Setup:**
- Use an account that has reached its message limit
- Or modify the backend to return a 403 error with quota message

**Steps:**
1. Open the Chat screen
2. Try to send a message
3. Observe the error alert

**Expected Result:**
- Alert title: "Mesaj Kotası Doldu"
- Alert message: Contains quota information from backend
- Two buttons: "Tamam" and "Premium'a Geç"
- Clicking "Premium'a Geç" shows "Yakında" alert (placeholder)

---

### 2. Network Error

**Setup:**
- Enable airplane mode on device
- Or disconnect from WiFi/cellular

**Steps:**
1. Open the Chat screen
2. Send a message
3. Observe the error alert

**Expected Result:**
- Alert title: "Bağlantı Hatası"
- Alert message: "İnternet bağlantınızı kontrol edin ve tekrar deneyin"
- Two buttons: "İptal" and "Tekrar Dene"
- Clicking "Tekrar Dene" attempts to resend the message
- Failed message is removed from UI

---

### 3. Timeout Error

**Setup:**
- Use a very slow network connection
- Or modify backend to delay responses beyond timeout

**Steps:**
1. Open the Chat screen
2. Send a message
3. Wait for timeout
4. Observe the error alert

**Expected Result:**
- Alert title: "Zaman Aşımı"
- Alert message: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin"
- Two buttons: "İptal" and "Tekrar Dene"
- Clicking "Tekrar Dene" attempts to resend the message

---

### 4. Rate Limit Error

**Setup:**
- Send many messages rapidly
- Or modify backend to return 429 status

**Steps:**
1. Open the Chat screen
2. Send multiple messages quickly
3. Observe the error alert

**Expected Result:**
- Alert title: "Sistem Yoğun"
- Alert message: "Sistem şu anda yoğun. Lütfen birkaç saniye bekleyip tekrar deneyin"
- Two buttons: "Tamam" and "Tekrar Dene"
- Clicking "Tekrar Dene" waits 2 seconds before retrying

---

### 5. Unauthorized Error (401)

**Setup:**
- Use an expired JWT token
- Or manually delete the access token

**Steps:**
1. Open the Chat screen
2. Send a message
3. Observe the error alert

**Expected Result:**
- Alert title: "Hata"
- Alert message: "Oturum süresi doldu, lütfen tekrar giriş yapın"
- User should be redirected to login (future enhancement)

---

### 6. Server Error (5xx)

**Setup:**
- Backend returns 500, 502, 503, or 504 error
- Can simulate by stopping the backend server

**Steps:**
1. Open the Chat screen
2. Send a message
3. Observe the error alert

**Expected Result:**
- Alert title: "Hata"
- Alert message: Starts with "Sunucu hatası: " followed by error details
- Single "Tamam" button

---

### 7. Streaming Error During Response

**Setup:**
- Start a message streaming
- Interrupt the connection mid-stream

**Steps:**
1. Open the Chat screen
2. Send a message
3. While streaming, turn on airplane mode
4. Observe the error alert

**Expected Result:**
- Streaming stops
- Temporary assistant message is removed
- Error alert is shown based on error type
- User can retry the message

---

### 8. Stop Button During Streaming

**Setup:**
- Normal network conditions

**Steps:**
1. Open the Chat screen
2. Send a message
3. While streaming, click "Durdur" button
4. Observe behavior

**Expected Result:**
- Streaming stops immediately
- Partial message is removed
- No error alert (user-initiated stop)
- Can send new message

---

## Testing Checklist

- [ ] Quota exceeded error shows upgrade option
- [ ] Network error shows retry option
- [ ] Timeout error shows retry option
- [ ] Rate limit error shows delayed retry
- [ ] Unauthorized error shows appropriate message
- [ ] Server error shows server error prefix
- [ ] Streaming errors are handled gracefully
- [ ] Failed messages are removed from UI
- [ ] Retry button resends the last user message
- [ ] Stop button works during streaming
- [ ] Error messages are in Turkish
- [ ] All alerts have appropriate titles
- [ ] Button labels are clear and actionable

---

## Manual Testing Tips

1. **Use React Native Debugger**: Monitor network requests and responses
2. **Check Console Logs**: Look for any unhandled errors
3. **Test on Both Platforms**: iOS and Android may behave differently
4. **Test Different Network Conditions**: WiFi, cellular, slow 3G, offline
5. **Test Edge Cases**: Very long messages, rapid message sending, etc.

---

## Automated Testing (Future)

Consider adding automated tests for:
- Error handler function with different error types
- SSE client error parsing
- Retry logic
- Message cleanup on error
- Alert button callbacks

---

## Known Limitations

1. **Premium Navigation**: Currently shows placeholder alert
2. **Retry Logic**: Simple retry without exponential backoff
3. **Offline Queue**: Messages are not queued when offline
4. **Error Analytics**: No tracking of error occurrences

---

## Debugging Tips

If errors are not showing correctly:

1. Check backend error response format
2. Verify error messages contain expected keywords
3. Check SSE client error parsing logic
4. Verify Alert.alert is not being blocked by other modals
5. Check console for any JavaScript errors
