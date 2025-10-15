#!/usr/bin/env node

/**
 * Quota Display Verification Script
 * 
 * This script verifies that the quota display implementation
 * in the chat screen is correct.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Quota Display Implementation...\n');

const chatFilePath = path.join(__dirname, 'app', '(tabs)', 'chat.tsx');
const chatContent = fs.readFileSync(chatFilePath, 'utf-8');

let passed = 0;
let failed = 0;

function test(name, condition, details = '') {
    if (condition) {
        console.log(`✅ ${name}`);
        passed++;
    } else {
        console.log(`❌ ${name}`);
        if (details) console.log(`   ${details}`);
        failed++;
    }
}

console.log('📋 Checking Implementation Details:\n');

// Test 1: Query configuration
test(
    'Quota query is configured',
    chatContent.includes("queryKey: ['quota']") &&
    chatContent.includes('quotaService.getStatus()'),
    'Query should use correct key and service'
);

// Test 2: Refetch interval
test(
    'Background refetch is enabled (30s)',
    chatContent.includes('refetchInterval: 30000'),
    'Should refresh every 30 seconds'
);

// Test 3: Authentication check
test(
    'Query is enabled only when authenticated',
    chatContent.includes('enabled: isAuthenticated'),
    'Should not fetch when user is not logged in'
);

// Test 4: Invalidation after streaming
test(
    'Quota is invalidated after streaming completes',
    chatContent.includes("queryClient.invalidateQueries({ queryKey: ['quota'] })") &&
    chatContent.includes('onDone:'),
    'Should invalidate quota in onDone callback'
);

// Test 5: Loading state
test(
    'Loading state is handled',
    chatContent.includes('isQuotaLoading') &&
    chatContent.includes('ActivityIndicator'),
    'Should show loading indicator'
);

// Test 6: Quota display
test(
    'Quota is displayed in header',
    chatContent.includes('quotaData') &&
    chatContent.includes('used') &&
    chatContent.includes('limit'),
    'Should display used/limit format'
);

// Test 7: Animation
test(
    'Animation is implemented',
    chatContent.includes('Animated.View') &&
    chatContent.includes('quotaAnimValue') &&
    chatContent.includes('useNativeDriver: true'),
    'Should animate quota updates'
);

// Test 8: Warning indicator
test(
    'Warning indicator for quota limit',
    chatContent.includes('used >= (quotaData as any).limit') &&
    chatContent.includes('⚠️'),
    'Should show warning when quota is exceeded'
);

// Test 9: Console logging
test(
    'Debug logging is present',
    chatContent.includes('[Chat] Streaming completed, quota invalidated'),
    'Should log when quota is invalidated'
);

// Test 10: Error handling
test(
    'Quota error handling exists',
    chatContent.includes("includes('kota')") ||
    chatContent.includes("includes('quota')"),
    'Should handle quota exceeded errors'
);

// Test 11: Animated import
test(
    'Animated is imported from react-native',
    chatContent.includes('Animated,') &&
    chatContent.includes("from 'react-native'"),
    'Should import Animated for animations'
);

// Test 12: useEffect for animation
test(
    'Animation effect is configured',
    chatContent.includes('useEffect(() => {') &&
    chatContent.includes('if (quotaData)') &&
    chatContent.includes('Animated.sequence'),
    'Should trigger animation when quota updates'
);

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
    console.log('✅ All checks passed! Quota display implementation is correct.\n');
    console.log('📝 Next Steps:');
    console.log('   1. Run the mobile app: cd apps/mobile && npx expo start');
    console.log('   2. Navigate to Chat tab');
    console.log('   3. Send a message and verify quota increments');
    console.log('   4. Check console for: "[Chat] Streaming completed, quota invalidated"');
    console.log('   5. Verify animation plays when quota updates');
    console.log('   6. See QUOTA_DISPLAY_VERIFICATION.md for detailed test scenarios\n');
    process.exit(0);
} else {
    console.log('❌ Some checks failed. Please review the implementation.\n');
    process.exit(1);
}
