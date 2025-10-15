# Gemini API Integration Test

This document describes how to test the Gemini API integration.

## Prerequisites

1. **API Key**: You need a valid Google Gemini API key
   - Get one from: https://aistudio.google.com/app/apikey
   - Set it in `apps/api/.env.local`:
     ```bash
     GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
     ```

2. **Dependencies**: Make sure all packages are installed
   ```bash
   pnpm install
   ```

## Running the Test

### Option 1: Using the test script (Recommended)

```bash
cd apps/api
npx ts-node src/chat/test-gemini-integration.ts
```

### Option 2: Using curl to test the actual endpoint

1. Start the API server:
   ```bash
   cd apps/api
   pnpm dev
   ```

2. In another terminal, create a test user and get a JWT token (if you don't have one)

3. Test the chat endpoint:
   ```bash
   # Create a conversation and send a message
   curl -X POST http://localhost:4000/chat/test-conversation-id/message \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"content": "Merhaba! Bu bir test mesajıdır."}'
   
   # Stream the response
   curl -N http://localhost:4000/chat/test-conversation-id/stream \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## What the Test Validates

The test script (`test-gemini-integration.ts`) validates:

1. ✅ **API Connection**: Verifies that the API key is valid and can connect to Gemini
2. ✅ **Streaming**: Confirms that streaming responses work correctly
3. ✅ **Token Counting**: Validates that token/chunk counting is accurate
4. ✅ **System Prompt**: Tests that system prompts are properly integrated

## Expected Output

When successful, you should see:

```
╔════════════════════════════════════════════════╗
║   Gemini API Integration Test Suite           ║
╚════════════════════════════════════════════════╝

🔍 Test 1: Gemini API Connection
──────────────────────────────────────────────────
✓ API key found in environment
✓ Model initialized: gemini-1.5-flash
✓ Response received: Test başarılı
✅ Gemini API connection successful

🔍 Test 2: Streaming Functionality
──────────────────────────────────────────────────
Streaming chunks:
1, 2, 3, 4, 5
✓ Received 5 chunks
✓ Full response: 1, 2, 3, 4, 5
✅ Streaming works correctly

🔍 Test 3: Token Counting
──────────────────────────────────────────────────
✓ Token count (chunks): 12
✓ Response length: 45 characters
✓ Response: Merhaba! Size nasıl yardımcı olabilirim?
✅ Token counting works correctly

🔍 Test 4: System Prompt Integration
──────────────────────────────────────────────────
✓ Response with system prompt: Merhaba! Ben NOVA...
✓ Mentions NOVA: Yes
✓ Response in Turkish: Yes
✅ System prompt integration works

╔════════════════════════════════════════════════╗
║   Test Summary                                 ║
╚════════════════════════════════════════════════╝

1. ✅ Gemini API connection successful
2. ✅ Streaming works correctly
3. ✅ Token counting works correctly
4. ✅ System prompt integration works

──────────────────────────────────────────────────
Results: 4/4 tests passed
──────────────────────────────────────────────────
```

## Troubleshooting

### Error: API key not configured

```
❌ GOOGLE_GENERATIVE_AI_API_KEY is not configured
```

**Solution**: Set a valid API key in `.env.local`

### Error: API key invalid

```
❌ Gemini API connection failed
Details: { error: 'API key not valid' }
```

**Solution**: 
1. Verify your API key at https://aistudio.google.com/app/apikey
2. Make sure you copied the entire key
3. Check that there are no extra spaces in the `.env.local` file

### Error: Rate limit exceeded

```
❌ Gemini API connection failed
Details: { error: 'rate limit exceeded' }
```

**Solution**: Wait a few minutes and try again. The free tier has rate limits.

### Error: Network timeout

```
❌ Gemini API connection failed
Details: { error: 'timeout' }
```

**Solution**: Check your internet connection and try again.

## Next Steps

After successful testing:

1. ✅ Gemini API is working
2. ✅ Streaming is functional
3. ✅ Token counting is accurate
4. ➡️ Proceed to test with actual user context (Task 12)
5. ➡️ Test end-to-end chat flow (Task 13)
