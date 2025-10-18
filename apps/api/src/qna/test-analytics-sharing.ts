import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Test user credentials
const TEST_USER = {
    email: 'test@example.com',
    password: 'Test123456!',
};

let authToken: string;
let testQuestionId: string;
let testAnswerId: string;

async function login() {
    try {
        const response = await axios.post(`${API_URL}/auth/signin`, TEST_USER);
        authToken = response.data.accessToken;
        console.log('✅ Login successful');
        return authToken;
    } catch (error: any) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        throw error;
    }
}

async function createTestQuestion() {
    try {
        const response = await axios.post(
            `${API_URL}/qna/questions`,
            {
                title: 'Test Question for Analytics',
                content: 'This is a test question to generate analytics data.',
                category: 'GENERAL',
                tags: ['test', 'analytics'],
                isAnonymous: false,
            },
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        testQuestionId = response.data.id;
        console.log('✅ Test question created:', testQuestionId);
        return testQuestionId;
    } catch (error: any) {
        console.error('❌ Failed to create question:', error.response?.data || error.message);
        throw error;
    }
}

async function createTestAnswer() {
    try {
        const response = await axios.post(
            `${API_URL}/qna/questions/${testQuestionId}/answers`,
            {
                content: 'This is a test answer for analytics.',
            },
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        testAnswerId = response.data.id;
        console.log('✅ Test answer created:', testAnswerId);
        return testAnswerId;
    } catch (error: any) {
        console.error('❌ Failed to create answer:', error.response?.data || error.message);
        throw error;
    }
}

async function testAnalyticsOverview() {
    console.log('\n📊 Testing Analytics Overview...');
    try {
        const response = await axios.get(`${API_URL}/qna/analytics/overview`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('✅ Analytics Overview:', JSON.stringify(response.data, null, 2));

        // Verify structure
        const metrics = response.data;
        if (
            typeof metrics.totalQuestions === 'number' &&
            typeof metrics.totalAnswers === 'number' &&
            typeof metrics.averageAnswersPerQuestion === 'number' &&
            typeof metrics.activeUsers === 'number'
        ) {
            console.log('✅ Analytics overview structure is correct');
        } else {
            console.log('❌ Analytics overview structure is incorrect');
        }
    } catch (error: any) {
        console.error('❌ Failed to get analytics overview:', error.response?.data || error.message);
    }
}

async function testCategoryBreakdown() {
    console.log('\n📊 Testing Category Breakdown...');
    try {
        const response = await axios.get(`${API_URL}/qna/analytics/categories`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('✅ Category Breakdown:', JSON.stringify(response.data, null, 2));

        // Verify structure
        if (Array.isArray(response.data) && response.data.length > 0) {
            const firstCategory = response.data[0];
            if (
                firstCategory.category &&
                typeof firstCategory.count === 'number' &&
                typeof firstCategory.percentage === 'number'
            ) {
                console.log('✅ Category breakdown structure is correct');
            } else {
                console.log('❌ Category breakdown structure is incorrect');
            }
        } else {
            console.log('⚠️ No category data available');
        }
    } catch (error: any) {
        console.error('❌ Failed to get category breakdown:', error.response?.data || error.message);
    }
}

async function testTopContributors() {
    console.log('\n📊 Testing Top Contributors...');
    try {
        const response = await axios.get(`${API_URL}/qna/analytics/top-users?limit=5`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('✅ Top Contributors:', JSON.stringify(response.data, null, 2));

        // Verify structure
        if (Array.isArray(response.data)) {
            if (response.data.length > 0) {
                const firstUser = response.data[0];
                if (
                    firstUser.userId &&
                    firstUser.username &&
                    typeof firstUser.reputation === 'number' &&
                    typeof firstUser.answersGiven === 'number' &&
                    typeof firstUser.bestAnswers === 'number'
                ) {
                    console.log('✅ Top contributors structure is correct');
                } else {
                    console.log('❌ Top contributors structure is incorrect');
                }
            } else {
                console.log('⚠️ No top contributors data available');
            }
        } else {
            console.log('❌ Top contributors response is not an array');
        }
    } catch (error: any) {
        console.error('❌ Failed to get top contributors:', error.response?.data || error.message);
    }
}

async function testEngagementMetrics() {
    console.log('\n📊 Testing Engagement Metrics...');
    try {
        const response = await axios.get(`${API_URL}/qna/analytics/engagement`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('✅ Engagement Metrics:', JSON.stringify(response.data, null, 2));

        // Verify structure
        const metrics = response.data;
        if (
            typeof metrics.totalVotes === 'number' &&
            typeof metrics.totalComments === 'number' &&
            typeof metrics.totalFavorites === 'number' &&
            typeof metrics.totalFollows === 'number' &&
            typeof metrics.averageVotesPerAnswer === 'number' &&
            typeof metrics.averageCommentsPerQuestion === 'number'
        ) {
            console.log('✅ Engagement metrics structure is correct');
        } else {
            console.log('❌ Engagement metrics structure is incorrect');
        }
    } catch (error: any) {
        console.error('❌ Failed to get engagement metrics:', error.response?.data || error.message);
    }
}

async function testQuestionShareLink() {
    console.log('\n🔗 Testing Question Share Link...');
    try {
        const response = await axios.get(`${API_URL}/qna/questions/${testQuestionId}/share-link`);
        console.log('✅ Question Share Link:', JSON.stringify(response.data, null, 2));

        // Verify structure
        if (response.data.url && response.data.url.includes(testQuestionId)) {
            console.log('✅ Share link structure is correct');
        } else {
            console.log('❌ Share link structure is incorrect');
        }
    } catch (error: any) {
        console.error('❌ Failed to get question share link:', error.response?.data || error.message);
    }
}

async function testAnswerShareLink() {
    console.log('\n🔗 Testing Answer Share Link...');
    try {
        const response = await axios.get(`${API_URL}/qna/answers/${testAnswerId}/share-link`);
        console.log('✅ Answer Share Link:', JSON.stringify(response.data, null, 2));

        // Verify structure
        if (response.data.url && response.data.url.includes(testAnswerId)) {
            console.log('✅ Answer share link structure is correct');
        } else {
            console.log('❌ Answer share link structure is incorrect');
        }
    } catch (error: any) {
        console.error('❌ Failed to get answer share link:', error.response?.data || error.message);
    }
}

async function testQuestionShareMetadata() {
    console.log('\n🔗 Testing Question Share Metadata...');
    try {
        const response = await axios.get(`${API_URL}/qna/questions/${testQuestionId}/share-metadata`);
        console.log('✅ Question Share Metadata:', JSON.stringify(response.data, null, 2));

        // Verify structure
        const metadata = response.data;
        if (
            metadata.title &&
            metadata.description &&
            metadata.url &&
            metadata.type === 'question'
        ) {
            console.log('✅ Share metadata structure is correct');
        } else {
            console.log('❌ Share metadata structure is incorrect');
        }
    } catch (error: any) {
        console.error('❌ Failed to get question share metadata:', error.response?.data || error.message);
    }
}

async function testAnswerShareMetadata() {
    console.log('\n🔗 Testing Answer Share Metadata...');
    try {
        const response = await axios.get(`${API_URL}/qna/answers/${testAnswerId}/share-metadata`);
        console.log('✅ Answer Share Metadata:', JSON.stringify(response.data, null, 2));

        // Verify structure
        const metadata = response.data;
        if (
            metadata.title &&
            metadata.description &&
            metadata.url &&
            metadata.type === 'answer'
        ) {
            console.log('✅ Answer share metadata structure is correct');
        } else {
            console.log('❌ Answer share metadata structure is incorrect');
        }
    } catch (error: any) {
        console.error('❌ Failed to get answer share metadata:', error.response?.data || error.message);
    }
}

async function testTrackShare() {
    console.log('\n🔗 Testing Track Share...');
    try {
        const response = await axios.post(
            `${API_URL}/qna/questions/${testQuestionId}/track-share`,
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        console.log('✅ Track Share:', JSON.stringify(response.data, null, 2));

        if (response.data.success === true) {
            console.log('✅ Share tracking successful');
        } else {
            console.log('❌ Share tracking failed');
        }
    } catch (error: any) {
        console.error('❌ Failed to track share:', error.response?.data || error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting Analytics and Sharing Tests...\n');

    try {
        // Login
        await login();

        // Create test data
        await createTestQuestion();
        await createTestAnswer();

        // Test Analytics Endpoints
        await testAnalyticsOverview();
        await testCategoryBreakdown();
        await testTopContributors();
        await testEngagementMetrics();

        // Test Sharing Endpoints
        await testQuestionShareLink();
        await testAnswerShareLink();
        await testQuestionShareMetadata();
        await testAnswerShareMetadata();
        await testTrackShare();

        console.log('\n✅ All tests completed!');
    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
        process.exit(1);
    }
}

runTests();
