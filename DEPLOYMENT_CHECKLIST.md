# 🚀 Home Screen Deployment Checklist

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
