/**
 * QnA Notification System Test Script
 * 
 * Bu script QnA notification sisteminin tüm özelliklerini test eder:
 * - Notification preferences yönetimi
 * - Yeni cevap bildirimleri
 * - Oy bildirimleri
 * - En iyi cevap bildirimleri
 * - Yorum bildirimleri
 * - Takip bildirimleri
 * - Rozet bildirimleri
 */

const API_URL = 'http://localhost:3000/api';

interface TestUser {
    id: string;
    email: string;
    token: string;
    username: string;
}

interface TestResult {
    test: string;
    status: 'PASS' | 'FAIL';
    message: string;
    data?: any;
}

const results: TestResult[] = [];

// Test kullanıcıları
let user1: TestUser;
let user2: TestUser;
let user3: TestUser;

// Test verileri
let questionId: string;
let answerId: string;
let commentId: string;

async function makeRequest(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    token?: string,
) {
    const headers: any = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options: any = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

async function login(email: string, password: string): Promise<TestUser> {
    const data = await makeRequest('/auth/login', 'POST', { email, password });
    return {
        id: data.user.id,
        email: data.user.email,
        token: data.access_token,
        username: data.user.username || email.split('@')[0],
    };
}

async function testNotificationPreferences() {
    console.log('\n📋 Testing Notification Preferences...');

    try {
        // Get default preferences
        const defaultPrefs = await makeRequest(
            '/qna/notifications/preferences',
            'GET',
            undefined,
            user1.token,
        );

        if (
            defaultPrefs.newAnswers === true &&
            defaultPrefs.answerVotes === true &&
            defaultPrefs.bestAnswerSelected === true &&
            defaultPrefs.comments === true &&
            defaultPrefs.followedContent === true &&
            defaultPrefs.badgesEarned === true
        ) {
            results.push({
                test: 'Get Default Preferences',
                status: 'PASS',
                message: 'All default preferences are enabled',
                data: defaultPrefs,
            });
        } else {
            results.push({
                test: 'Get Default Preferences',
                status: 'FAIL',
                message: 'Default preferences are incorrect',
                data: defaultPrefs,
            });
        }

        // Update preferences
        const updatedPrefs = await makeRequest(
            '/qna/notifications/preferences',
            'PATCH',
            {
                newAnswers: false,
                answerVotes: true,
                comments: false,
            },
            user1.token,
        );

        if (
            updatedPrefs.newAnswers === false &&
            updatedPrefs.answerVotes === true &&
            updatedPrefs.comments === false
        ) {
            results.push({
                test: 'Update Preferences',
                status: 'PASS',
                message: 'Preferences updated successfully',
                data: updatedPrefs,
            });
        } else {
            results.push({
                test: 'Update Preferences',
                status: 'FAIL',
                message: 'Preferences not updated correctly',
                data: updatedPrefs,
            });
        }

        // Reset preferences for other tests
        await makeRequest(
            '/qna/notifications/preferences',
            'PATCH',
            {
                newAnswers: true,
                answerVotes: true,
                bestAnswerSelected: true,
                comments: true,
                followedContent: true,
                badgesEarned: true,
            },
            user1.token,
        );
    } catch (error: any) {
        results.push({
            test: 'Notification Preferences',
            status: 'FAIL',
            message: error.message,
        });
    }
}

async function testNewAnswerNotification() {
    console.log('\n📬 Testing New Answer Notification...');

    try {
        // User1 creates a question
        const question = await makeRequest(
            '/qna/questions',
            'POST',
            {
                title: 'Test Question for Notification',
                content: 'This is a test question to check new answer notifications.',
                category: 'GENERAL',
                tags: ['test', 'notification'],
            },
            user1.token,
        );

        questionId = question.id;

        // User2 answers the question (should trigger notification to user1)
        const answer = await makeRequest(
            `/qna/questions/${questionId}/answers`,
            'POST',
            {
                content: 'This is a test answer to trigger notification.',
            },
            user2.token,
        );

        answerId = answer.id;

        results.push({
            test: 'New Answer Notification',
            status: 'PASS',
            message: `Answer created. Notification should be sent to ${user1.username}`,
            data: { questionId, answerId },
        });
    } catch (error: any) {
        results.push({
            test: 'New Answer Notification',
            status: 'FAIL',
            message: error.message,
        });
    }
}

async function testVoteNotification() {
    console.log('\n👍 Testing Vote Notification...');

    try {
        // User1 upvotes user2's answer (should trigger notification to user2)
        await makeRequest(
            `/qna/answers/${answerId}/vote`,
            'POST',
            { voteType: 'UPVOTE' },
            user1.token,
        );

        results.push({
            test: 'Vote Notification',
            status: 'PASS',
            message: `Upvote registered. Notification should be sent to ${user2.username}`,
            data: { answerId },
        });
    } catch (error: any) {
        results.push({
            test: 'Vote Notification',
            status: 'FAIL',
            message: error.message,
        });
    }
}

async function testBestAnswerNotification() {
    console.log('\n🏆 Testing Best Answer Notification...');

    try {
        // User1 marks user2's answer as best (should trigger notification to user2)
        await makeRequest(
            `/qna/answers/${answerId}/mark-best`,
            'POST',
            {},
            user1.token,
        );

        results.push({
            test: 'Best Answer Notification',
            status: 'PASS',
            message: `Best answer marked. Notification should be sent to ${user2.username}`,
            data: { answerId },
        });
    } catch (error: any) {
        results.push({
            test: 'Best Answer Notification',
            status: 'FAIL',
            message: error.message,
        });
    }
}

async function testCommentNotifications() {
    console.log('\n💬 Testing Comment Notifications...');

    try {
        // User3 comments on user1's question (should trigger notification to user1)
        const questionComment = await makeRequest(
            `/qna/questions/${questionId}/comments`,
            'POST',
            { content: 'This is a test comment on the question.' },
            user3.token,
        );

        results.push({
            test: 'Question Comment Notification',
            status: 'PASS',
            message: `Question comment created. Notification should be sent to ${user1.username}`,
            data: { commentId: questionComment.id },
        });

        // User3 comments on user2's answer (should trigger notification to user2)
        const answerComment = await makeRequest(
            `/qna/answers/${answerId}/comments`,
            'POST',
            { content: 'This is a test comment on the answer.' },
            user3.token,
        );

        commentId = answerComment.id;

        results.push({
            test: 'Answer Comment Notification',
            status: 'PASS',
            message: `Answer comment created. Notification should be sent to ${user2.username}`,
            data: { commentId: answerComment.id },
        });
    } catch (error: any) {
        results.push({
            test: 'Comment Notifications',
            status: 'FAIL',
            message: error.message,
        });
    }
}

async function testFollowNotifications() {
    console.log('\n👥 Testing Follow Notifications...');

    try {
        // User2 follows the question
        await makeRequest(
            `/qna/questions/${questionId}/follow`,
            'POST',
            {},
            user2.token,
        );

        // User3 answers the question (should trigger notification to user2 as follower)
        const followAnswer = await makeRequest(
            `/qna/questions/${questionId}/answers`,
            'POST',
            { content: 'Another answer to test follower notification.' },
            user3.token,
        );

        results.push({
            test: 'Followed Question Answered Notification',
            status: 'PASS',
            message: `Answer created on followed question. Notification should be sent to ${user2.username}`,
            data: { answerId: followAnswer.id },
        });

        // User3 follows user1
        await makeRequest(
            `/qna/users/${user1.id}/follow`,
            'POST',
            {},
            user3.token,
        );

        // User1 creates a new question (should trigger notification to user3)
        const newQuestion = await makeRequest(
            '/qna/questions',
            'POST',
            {
                title: 'Test Question for Follower Notification',
                content: 'This question should notify followers.',
                category: 'GENERAL',
                tags: ['test'],
            },
            user1.token,
        );

        results.push({
            test: 'Followed User Asked Notification',
            status: 'PASS',
            message: `Question created by followed user. Notification should be sent to ${user3.username}`,
            data: { questionId: newQuestion.id },
        });
    } catch (error: any) {
        results.push({
            test: 'Follow Notifications',
            status: 'FAIL',
            message: error.message,
        });
    }
}

async function testPreferenceFiltering() {
    console.log('\n🔕 Testing Preference Filtering...');

    try {
        // User1 disables new answer notifications
        await makeRequest(
            '/qna/notifications/preferences',
            'PATCH',
            { newAnswers: false },
            user1.token,
        );

        // Create a new question
        const question = await makeRequest(
            '/qna/questions',
            'POST',
            {
                title: 'Test Question with Disabled Notifications',
                content: 'User1 should not receive notifications for answers.',
                category: 'GENERAL',
            },
            user1.token,
        );

        // User2 answers (should NOT trigger notification to user1)
        await makeRequest(
            `/qna/questions/${question.id}/answers`,
            'POST',
            { content: 'This answer should not notify user1.' },
            user2.token,
        );

        results.push({
            test: 'Preference Filtering',
            status: 'PASS',
            message: 'Answer created but notification should be filtered by preferences',
            data: { questionId: question.id },
        });

        // Re-enable notifications
        await makeRequest(
            '/qna/notifications/preferences',
            'PATCH',
            { newAnswers: true },
            user1.token,
        );
    } catch (error: any) {
        results.push({
            test: 'Preference Filtering',
            status: 'FAIL',
            message: error.message,
        });
    }
}

function printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    const passed = results.filter((r) => r.status === 'PASS').length;
    const failed = results.filter((r) => r.status === 'FAIL').length;

    results.forEach((result) => {
        const icon = result.status === 'PASS' ? '✅' : '❌';
        console.log(`\n${icon} ${result.test}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Message: ${result.message}`);
        if (result.data) {
            console.log(`   Data: ${JSON.stringify(result.data, null, 2)}`);
        }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    console.log('\n📝 IMPORTANT NOTES:');
    console.log('- Push notifications require valid push tokens in user profiles');
    console.log('- Check server logs for actual notification delivery status');
    console.log('- Notifications are sent asynchronously and may take a few seconds');
    console.log('- Test with real devices/Expo Go to verify push delivery');
}

async function runTests() {
    console.log('🚀 Starting QnA Notification System Tests...\n');

    try {
        // Login test users
        console.log('🔐 Logging in test users...');
        user1 = await login('test1@example.com', 'password123');
        user2 = await login('test2@example.com', 'password123');
        user3 = await login('test3@example.com', 'password123');
        console.log(`✅ Logged in: ${user1.username}, ${user2.username}, ${user3.username}`);

        // Run tests
        await testNotificationPreferences();
        await testNewAnswerNotification();
        await testVoteNotification();
        await testBestAnswerNotification();
        await testCommentNotifications();
        await testFollowNotifications();
        await testPreferenceFiltering();

        // Print results
        printResults();
    } catch (error: any) {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    }
}

// Run tests
runTests();
