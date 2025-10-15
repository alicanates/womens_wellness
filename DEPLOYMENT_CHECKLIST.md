# 🚀 Deployment Checklist

Use this checklist to verify everything is ready for deployment.

---

## 🤖 Gemini AI Integration Deployment

### Pre-Deployment Verification

#### Environment Configuration
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY` set in production environment
- [ ] API key tested and validated
- [ ] API key has sufficient quota (15 req/min minimum)
- [ ] Backup AI provider configured (OpenAI or Anthropic)
- [ ] All environment variables documented

#### Backend (API)
- [ ] ContextBuilderService created and tested
- [ ] ChatService updated to use Gemini API
- [ ] `@ai-sdk/google` package installed
- [ ] TypeScript compilation successful
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Error handling implemented for all scenarios
- [ ] Quota system working correctly
- [ ] Turkish error messages verified

#### Testing Checklist
- [ ] Gemini API connection test passed
  ```bash
  cd apps/api
  pnpm test:gemini
  ```
- [ ] Context building tests passed (4 scenarios)
  ```bash
  pnpm test context-builder.service.spec.ts
  ```
- [ ] End-to-end chat flow test passed
  ```bash
  pnpm test:chat-flow
  ```
- [ ] Error scenarios test passed
  ```bash
  pnpm test:error-scenarios
  ```
- [ ] Forget conversation test passed
  ```bash
  pnpm test:forget-conversation
  ```

#### Mobile App
- [ ] SSE buffer optimization verified
- [ ] Chat screen error handling tested
- [ ] Quota display updates correctly
- [ ] iOS platform tested
- [ ] Android platform tested
- [ ] Keyboard behavior correct
- [ ] Auto-scroll working
- [ ] "Stop" button functional
- [ ] "Forget" button functional

#### Performance & Optimization
- [ ] Database queries optimized (indexes verified)
- [ ] Context building queries use select for specific fields
- [ ] Conversation history limited to 10 messages
- [ ] SSE buffer size configured (512 chars)
- [ ] Flush interval optimized (50ms)
- [ ] API timeout set (30s)

#### Security
- [ ] API key not logged anywhere
- [ ] No PII sent to Gemini API
- [ ] User data encrypted in database
- [ ] JWT authentication working
- [ ] Conversation ownership verified
- [ ] Rate limiting per user active

### Functional Testing

#### Chat Functionality
- [ ] New conversation creation works
- [ ] Message sending works
- [ ] Streaming response displays correctly
- [ ] Messages saved to database
- [ ] Conversation history loads correctly
- [ ] Context includes user health data
- [ ] System prompt personalized correctly

#### User Context Scenarios
- [ ] Pregnant user context correct
  - Weeks/days calculated
  - Trimester shown
  - Due date displayed
  - Anonymous mode respected
- [ ] Cycling user context correct
  - Cycle day calculated
  - Phase determined
  - Next period estimated
- [ ] Wellness data context correct
  - Water intake shown
  - Steps displayed
  - Meditation minutes shown
  - Sleep data included
- [ ] New user (no data) handled gracefully

#### Error Handling
- [ ] Timeout error shows user-friendly message
- [ ] Rate limit error shows retry suggestion
- [ ] Network error shows connection message
- [ ] API key error logged (not shown to user)
- [ ] Quota exceeded shows upgrade option
- [ ] Invalid request handled gracefully

#### Quota Management
- [ ] Free plan: 100 messages/month enforced
- [ ] Premium plan: 1000 messages/month enforced
- [ ] Quota increments after successful response
- [ ] Quota display updates in real-time
- [ ] Quota reset works on new month
- [ ] Quota exceeded message in Turkish

### API Testing

Test with authenticated user token:

```bash
# Send message
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Merhaba NOVA"}' \
  http://localhost:4000/chat/CONVERSATION_ID/message

# Stream response (SSE)
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/chat/CONVERSATION_ID/stream

# Forget conversation
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/chat/CONVERSATION_ID/forget

# Check quota
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/quota
```

- [ ] All endpoints return expected responses
- [ ] SSE streaming works correctly
- [ ] Error responses in Turkish
- [ ] Authentication required for all endpoints

### Performance Testing
- [ ] First token latency < 2s
- [ ] Full response time < 10s (average)
- [ ] Context building < 500ms
- [ ] Database queries < 100ms each
- [ ] No memory leaks during streaming
- [ ] Concurrent users handled (10+ simultaneous)

### Edge Cases
- [ ] Very long message (500 chars)
- [ ] Rapid successive messages
- [ ] Connection interrupted during streaming
- [ ] User deletes conversation mid-stream
- [ ] Quota limit reached mid-conversation
- [ ] API key invalid/expired
- [ ] Gemini API down (fallback works)
- [ ] Database connection lost
- [ ] Redis connection lost

### Documentation
- [x] README updated with Gemini setup instructions
- [x] Environment variables documented
- [x] API endpoints documented
- [x] Testing guides created
- [x] Deployment checklist updated (this file)
- [ ] Production deployment guide reviewed

### Deployment Steps

#### 1. Pre-Deployment
```bash
# Validate environment
cd apps/api
pnpm validate:env

# Run all tests
pnpm test

# Build API
pnpm build
```

#### 2. Deploy API
```bash
# Set environment variables on production server
export GOOGLE_GENERATIVE_AI_API_KEY="your-production-key"
export DATABASE_URL="production-url"
export REDIS_URL="production-url"
export JWT_SECRET="production-secret"
export JWT_REFRESH_SECRET="production-secret"

# Deploy application
# (deployment method depends on your infrastructure)

# Verify deployment
curl https://your-api.com/healthz
```

#### 3. Deploy Mobile App
```bash
cd apps/mobile

# Update API URL in .env.local
EXPO_PUBLIC_API_URL=https://your-api.com

# Build and submit
eas build --platform all
eas submit --platform all
```

#### 4. Monitor
- [ ] Check API logs for errors
- [ ] Monitor Gemini API usage
- [ ] Track response times
- [ ] Monitor quota consumption
- [ ] Check error rates
- [ ] Review user feedback
- [ ] Monitor costs (Gemini API usage)

### Rollback Plan

If issues arise:

1. **Gemini API Issues**:
   - Switch to backup provider (OpenAI/Anthropic) via admin panel
   - Update model policy to use different provider
   - No code changes needed

2. **Performance Issues**:
   - Increase API timeout
   - Reduce conversation history limit
   - Disable context building temporarily
   - Scale up server resources

3. **Critical Bugs**:
   - Revert to previous deployment
   - Disable chat feature via feature flag
   - Show maintenance message to users

### Monitoring Metrics

Track these metrics post-deployment:

- **API Performance**:
  - Average response time
  - First token latency
  - Error rate by type
  - Timeout rate

- **Usage**:
  - Messages per day
  - Active conversations
  - Quota consumption rate
  - User engagement

- **Costs**:
  - Gemini API requests/day
  - Token usage
  - Estimated monthly cost

- **Quality**:
  - User satisfaction (feedback)
  - Conversation length
  - Retry rate
  - Error recovery rate

### Sign-off

- [ ] Backend Developer: _______________
- [ ] Frontend Developer: _______________
- [ ] QA Engineer: _______________
- [ ] Product Manager: _______________
- [ ] DevOps Engineer: _______________

Date: _______________

---

## 🏠 Home Screen Deployment Checklist

Use this checklist to verify everything is ready for deployment.

## Pre-Deployment Verification

### Database
- [x] Migration created: `20251007203642_add_home_preferences`
- [x] Migration applied successfully
- [x] Prisma client regenerated
- [ ] Seed educational articles (optional but recommended)
  ```bash
  cd apps/api
  DATABASE_URL="..." pnpm prisma:seed
  ```

### Backend (API)
- [x] HomeModule created and registered in app.module.ts
- [x] HomeService implements all business logic
- [x] HomeController exposes 5 endpoints
- [x] TypeScript compilation successful
- [x] Build completes without errors
- [ ] API server starts successfully
  ```bash
  cd apps/api
  DATABASE_URL="..." pnpm dev
  ```
- [ ] Test GET /home/snapshot endpoint with curl or Postman

### Frontend (Mobile)
- [x] New home screen created with all 5 zones
- [x] Old home screen backed up as home-old.tsx
- [x] Components created (StreakChip, StatusPill, PriorityCard)
- [x] API service updated with homeService
- [x] All imports resolve correctly
- [ ] Mobile app builds successfully
  ```bash
  cd apps/mobile
  pnpm dev
  ```
- [ ] Navigate to home screen and verify it loads

### Localization
- [x] Turkish (TR) translations complete
- [x] English (EN) translations complete
- [ ] Test both locales work correctly

## Functional Testing

### Zone A - Identity & Quick Access
- [ ] Greeting changes based on time of day
- [ ] User display name shows correctly
- [ ] Profile picture loads (or placeholder shows)
- [ ] Tapping avatar navigates to Settings
- [ ] Streak chip appears when streak > 0
- [ ] Streak chip shows correct count

### Zone B - Status Pills
- [ ] Pills scroll horizontally
- [ ] Cycle pill shows when data exists
- [ ] Pregnancy pill shows when active
- [ ] Water pill shows current progress
- [ ] Reminders pill shows count
- [ ] Tapping pills navigates to correct screens

### Zone C - Priority Cards
- [ ] Cards display based on priority
- [ ] Hydration card shows when behind target
- [ ] Cycle insight card shows near period date
- [ ] Symptom log card always available
- [ ] Reminders card shows upcoming
- [ ] NOVA prompt shows (max once per day)
- [ ] Dismiss button (✕) works
- [ ] Dismissed cards disappear

### Zone D - Educational Articles
- [ ] Articles appear (if seeded)
- [ ] Category labels display correctly
- [ ] Title and excerpt visible
- [ ] Tapping article shows full content (or placeholder)

### Zone E - Quick Actions
- [ ] Su Ekle navigates to water screen
- [ ] Semptom Ekle navigates to calendar
- [ ] Metrikler navigates to BMI calculator

### General Features
- [ ] Pull-to-refresh updates data
- [ ] Loading state shows while fetching
- [ ] Empty state shows when no cards
- [ ] Dark mode renders correctly
- [ ] Light mode renders correctly
- [ ] No console errors
- [ ] No TypeScript errors

## API Testing

Test with authenticated user token:

```bash
# Get snapshot
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/home/snapshot

# Dismiss card
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cardId":"hydration","days":7}' \
  http://localhost:4000/home/cards/dismiss

# Pin card
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cardId":"cycle_insight"}' \
  http://localhost:4000/home/cards/pin
```

- [ ] All endpoints return 200 OK
- [ ] Response structure matches expected types
- [ ] Error handling works (401 for unauthorized)

## Performance Testing
- [ ] API /home/snapshot responds in <500ms
- [ ] Mobile home screen renders in <200ms (cached)
- [ ] Pull-to-refresh completes in <1s
- [ ] No memory leaks in app
- [ ] Smooth scrolling on all zones

## Edge Cases
- [ ] New user with no data (should show empty states)
- [ ] User with incomplete profile
- [ ] User with no cycle data
- [ ] User with no pregnancy
- [ ] User with no water logs
- [ ] User with no reminders
- [ ] All cards dismissed (should show empty state)
- [ ] Network offline (should show cached data)
- [ ] Network error (should show error message)

## Documentation
- [x] Implementation summary created
- [x] Activation guide created
- [x] Deployment checklist created (this file)
- [x] API endpoints documented
- [x] Component usage documented

## Deployment Steps

### 1. Deploy Database Changes
```bash
# On production server
cd apps/api
DATABASE_URL="production_url" npx prisma migrate deploy
DATABASE_URL="production_url" npx prisma generate
```

### 2. Deploy API
```bash
cd apps/api
npm run build
# Deploy dist/ folder to production
# Ensure environment variables are set
```

### 3. Deploy Mobile App
```bash
cd apps/mobile
# For iOS
eas build --platform ios
eas submit --platform ios

# For Android
eas build --platform android
eas submit --platform android
```

### 4. Monitor
- [ ] Check server logs for errors
- [ ] Monitor API response times
- [ ] Track user engagement metrics
- [ ] Monitor crash reports
- [ ] Check user feedback

## Rollback Plan

If issues arise:

1. **API Issues**:
   - Revert app.module.ts to remove HomeModule
   - Restart API server
   - Old endpoints remain functional

2. **Mobile Issues**:
   - Rename home.tsx to home-new.tsx
   - Rename home-old.tsx to home.tsx
   - Push hotfix update

3. **Database Issues**:
   - New tables are non-breaking (no existing data affected)
   - Can safely leave tables empty
   - Or migrate down:
     ```bash
     npx prisma migrate resolve --rolled-back 20251007203642_add_home_preferences
     ```

## Sign-off

- [ ] Backend Developer: _______________
- [ ] Frontend Developer: _______________
- [ ] QA Engineer: _______________
- [ ] Product Manager: _______________
- [ ] DevOps Engineer: _______________

Date: _______________

---

**Once all checkboxes are complete, the Home Screen Revamp is ready for production deployment!** 🎉
