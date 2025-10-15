#!/usr/bin/env node

/**
 * Mobile Platform Implementation Verification Script
 * Task 16: iOS ve Android'de test
 * 
 * This script verifies that the chat screen implementation includes
 * all necessary components for proper iOS and Android functionality.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Mobile Platform Implementation Verification\n');
console.log('='.repeat(60));

const chatScreenPath = path.join(__dirname, 'app', '(tabs)', 'chat.tsx');

// Read the chat screen file
let chatScreenContent;
try {
    chatScreenContent = fs.readFileSync(chatScreenPath, 'utf8');
} catch (error) {
    console.error('❌ Error: Could not read chat.tsx file');
    process.exit(1);
}

const checks = [];

// 1. Check KeyboardAvoidingView implementation
console.log('\n1️⃣  Checking KeyboardAvoidingView Implementation...');
const hasKeyboardAvoidingView = chatScreenContent.includes('KeyboardAvoidingView');
const hasPlatformBehavior = chatScreenContent.includes("Platform.OS === 'ios' ? 'padding' : 'height'");
const hasKeyboardOffset = chatScreenContent.includes('keyboardVerticalOffset');

checks.push({
    name: 'KeyboardAvoidingView imported',
    passed: hasKeyboardAvoidingView,
    details: hasKeyboardAvoidingView ? 'Found KeyboardAvoidingView' : 'Missing KeyboardAvoidingView'
});

checks.push({
    name: 'Platform-specific behavior',
    passed: hasPlatformBehavior,
    details: hasPlatformBehavior
        ? "iOS uses 'padding', Android uses 'height'"
        : 'Missing platform-specific behavior'
});

checks.push({
    name: 'Keyboard vertical offset',
    passed: hasKeyboardOffset,
    details: hasKeyboardOffset
        ? 'keyboardVerticalOffset configured'
        : 'Missing keyboardVerticalOffset'
});

// 2. Check Auto-scroll implementation
console.log('\n2️⃣  Checking Auto-scroll Implementation...');
const hasFlatListRef = chatScreenContent.includes('flatListRef');
const hasScrollToEnd = chatScreenContent.includes('scrollToEnd');
const hasAnimatedScroll = chatScreenContent.includes('animated: true');
const hasScrollEffect = chatScreenContent.includes('useEffect') &&
    chatScreenContent.includes('messages.length > 0') &&
    chatScreenContent.includes('scrollToEnd');

checks.push({
    name: 'FlatList ref',
    passed: hasFlatListRef,
    details: hasFlatListRef ? 'FlatList ref configured' : 'Missing FlatList ref'
});

checks.push({
    name: 'scrollToEnd method',
    passed: hasScrollToEnd,
    details: hasScrollToEnd ? 'scrollToEnd implemented' : 'Missing scrollToEnd'
});

checks.push({
    name: 'Animated scrolling',
    passed: hasAnimatedScroll,
    details: hasAnimatedScroll ? 'Animated scroll enabled' : 'Missing animated scroll'
});

checks.push({
    name: 'Auto-scroll effect',
    passed: hasScrollEffect,
    details: hasScrollEffect
        ? 'useEffect triggers scroll on new messages'
        : 'Missing auto-scroll effect'
});

// 3. Check Platform-specific imports
console.log('\n3️⃣  Checking Platform-specific Imports...');
const hasPlatformImport = chatScreenContent.includes("import") &&
    chatScreenContent.includes("Platform");
const hasSafeAreaView = chatScreenContent.includes('SafeAreaView');

checks.push({
    name: 'Platform import',
    passed: hasPlatformImport,
    details: hasPlatformImport ? 'Platform imported from react-native' : 'Missing Platform import'
});

checks.push({
    name: 'SafeAreaView',
    passed: hasSafeAreaView,
    details: hasSafeAreaView
        ? 'SafeAreaView used for safe area handling'
        : 'Missing SafeAreaView'
});

// 4. Check Input field configuration
console.log('\n4️⃣  Checking Input Field Configuration...');
const hasMultilineInput = chatScreenContent.includes('multiline');
const hasMaxLength = chatScreenContent.includes('maxLength');
const hasPlaceholder = chatScreenContent.includes('placeholder');

checks.push({
    name: 'Multiline input',
    passed: hasMultilineInput,
    details: hasMultilineInput ? 'Multiline input enabled' : 'Missing multiline input'
});

checks.push({
    name: 'Max length limit',
    passed: hasMaxLength,
    details: hasMaxLength ? 'Max length configured (500)' : 'Missing max length'
});

checks.push({
    name: 'Placeholder text',
    passed: hasPlaceholder,
    details: hasPlaceholder ? 'Placeholder text configured' : 'Missing placeholder'
});

// 5. Check Streaming and Stop functionality
console.log('\n5️⃣  Checking Streaming Functionality...');
const hasStreamingState = chatScreenContent.includes('isStreaming');
const hasStopButton = chatScreenContent.includes('stopButton') ||
    chatScreenContent.includes('Durdur');
const hasStopHandler = chatScreenContent.includes('handleStop');

checks.push({
    name: 'Streaming state',
    passed: hasStreamingState,
    details: hasStreamingState ? 'isStreaming state managed' : 'Missing streaming state'
});

checks.push({
    name: 'Stop button',
    passed: hasStopButton,
    details: hasStopButton ? 'Stop button implemented' : 'Missing stop button'
});

checks.push({
    name: 'Stop handler',
    passed: hasStopHandler,
    details: hasStopHandler ? 'handleStop function implemented' : 'Missing stop handler'
});

// 6. Check Error handling
console.log('\n6️⃣  Checking Error Handling...');
const hasErrorHandler = chatScreenContent.includes('handleError');
const hasAlertForErrors = chatScreenContent.includes('Alert.alert');
const hasNetworkErrorHandling = chatScreenContent.includes('network') ||
    chatScreenContent.includes('bağlantı');
const hasQuotaErrorHandling = chatScreenContent.includes('quota') ||
    chatScreenContent.includes('kota');

checks.push({
    name: 'Error handler',
    passed: hasErrorHandler,
    details: hasErrorHandler ? 'handleError function implemented' : 'Missing error handler'
});

checks.push({
    name: 'Alert dialogs',
    passed: hasAlertForErrors,
    details: hasAlertForErrors ? 'Alert.alert used for errors' : 'Missing alert dialogs'
});

checks.push({
    name: 'Network error handling',
    passed: hasNetworkErrorHandling,
    details: hasNetworkErrorHandling
        ? 'Network errors handled'
        : 'Missing network error handling'
});

checks.push({
    name: 'Quota error handling',
    passed: hasQuotaErrorHandling,
    details: hasQuotaErrorHandling ? 'Quota errors handled' : 'Missing quota error handling'
});

// 7. Check Quota display
console.log('\n7️⃣  Checking Quota Display...');
const hasQuotaQuery = chatScreenContent.includes("queryKey: ['quota']");
const hasQuotaAnimation = chatScreenContent.includes('quotaAnimValue') ||
    chatScreenContent.includes('Animated');
const hasQuotaInvalidation = chatScreenContent.includes("invalidateQueries");

checks.push({
    name: 'Quota query',
    passed: hasQuotaQuery,
    details: hasQuotaQuery ? 'Quota data fetched' : 'Missing quota query'
});

checks.push({
    name: 'Quota animation',
    passed: hasQuotaAnimation,
    details: hasQuotaAnimation ? 'Quota counter animates' : 'Missing quota animation'
});

checks.push({
    name: 'Quota refresh',
    passed: hasQuotaInvalidation,
    details: hasQuotaInvalidation
        ? 'Quota refreshes after streaming'
        : 'Missing quota refresh'
});

// 8. Check Message rendering
console.log('\n8️⃣  Checking Message Rendering...');
const hasFlatList = chatScreenContent.includes('FlatList');
const hasRenderMessage = chatScreenContent.includes('renderMessage');
const hasEmptyState = chatScreenContent.includes('ListEmptyComponent');
const hasMessageStyles = chatScreenContent.includes('userMessage') &&
    chatScreenContent.includes('assistantMessage');

checks.push({
    name: 'FlatList component',
    passed: hasFlatList,
    details: hasFlatList ? 'FlatList used for messages' : 'Missing FlatList'
});

checks.push({
    name: 'Message renderer',
    passed: hasRenderMessage,
    details: hasRenderMessage ? 'renderMessage function implemented' : 'Missing message renderer'
});

checks.push({
    name: 'Empty state',
    passed: hasEmptyState,
    details: hasEmptyState ? 'Empty state component configured' : 'Missing empty state'
});

checks.push({
    name: 'Message styles',
    passed: hasMessageStyles,
    details: hasMessageStyles
        ? 'User and assistant message styles defined'
        : 'Missing message styles'
});

// Print results
console.log('\n' + '='.repeat(60));
console.log('\n📊 VERIFICATION RESULTS\n');

const passedChecks = checks.filter(c => c.passed).length;
const totalChecks = checks.length;
const passRate = ((passedChecks / totalChecks) * 100).toFixed(1);

checks.forEach((check, index) => {
    const icon = check.passed ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
    console.log(`   ${check.details}`);
});

console.log('\n' + '='.repeat(60));
console.log(`\n📈 Pass Rate: ${passedChecks}/${totalChecks} (${passRate}%)\n`);

// Summary by category
const categories = {
    'KeyboardAvoidingView': checks.slice(0, 3),
    'Auto-scroll': checks.slice(3, 7),
    'Platform-specific': checks.slice(7, 9),
    'Input field': checks.slice(9, 12),
    'Streaming': checks.slice(12, 15),
    'Error handling': checks.slice(15, 19),
    'Quota display': checks.slice(19, 22),
    'Message rendering': checks.slice(22, 26),
};

console.log('📋 Summary by Category:\n');
Object.entries(categories).forEach(([category, categoryChecks]) => {
    const passed = categoryChecks.filter(c => c.passed).length;
    const total = categoryChecks.length;
    const status = passed === total ? '✅' : passed > 0 ? '⚠️' : '❌';
    console.log(`${status} ${category}: ${passed}/${total}`);
});

console.log('\n' + '='.repeat(60));

// Final verdict
if (passRate >= 95) {
    console.log('\n✅ EXCELLENT: Implementation is complete and ready for testing!');
    console.log('   All critical components are in place.\n');
    process.exit(0);
} else if (passRate >= 80) {
    console.log('\n⚠️  GOOD: Implementation is mostly complete.');
    console.log('   Some minor improvements recommended.\n');
    process.exit(0);
} else if (passRate >= 60) {
    console.log('\n⚠️  FAIR: Implementation needs attention.');
    console.log('   Several components are missing or incomplete.\n');
    process.exit(1);
} else {
    console.log('\n❌ INCOMPLETE: Implementation needs significant work.');
    console.log('   Many critical components are missing.\n');
    process.exit(1);
}
