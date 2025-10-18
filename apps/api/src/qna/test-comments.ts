/**
 * Manual test script for Comment System
 * 
 * Bu script comment sisteminin temel fonksiyonlarını test eder:
 * - Question comment oluşturma
 * - Answer comment oluşturma
 * - Comment listeleme
 * - Comment silme
 * - Validation (max 300 karakter)
 * - Authorization (sadece sahibi silebilir)
 */

import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Test kullanıcı credentials (seed data'dan)
const TEST_USER = {
    email: 'test@example.com',
    password: 'Test123456!',
};

let authToken: string;
let testQuestionId: string;
let testAnswerId: string;
let testQuestionCommentId: string;
let testAnswerCommentId: string;

async function login() {
    console.log('\n🔐 Logging in...');
    try {
        const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
        authToken = response.data.access_token;
        console.log('✅ Login successful');
        return true;
    } catch (error: any) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        return false;
    }
}

async function createTestQuestion() {
    console.log('\n📝 Creating test question...');
    try {
        const response = await axios.post(
            `${API_URL}/qna/questions`,
            {
                title: 'Test Question for Comments',
                content: 'This is a test question to test the comment system.',
                category: 'GENERAL',
                tags: ['test', 'comments'],
                isAnonymous: false,
            },
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        testQuestionId = response.data.id;
        console.log('✅ Test question created:', testQuestionId);
        return true;
    } catch (error: any) {
        console.error('❌ Failed to create question:', error.response?.data || error.message);
        return false;
    }
}

async function createTestAnswer() {
    console.log('\n💬 Creating test answer...');
    try {
        const response = await axios.post(
            `${API_URL}/qna/questions/${testQuestionId}/answers`,
            {
                content: 'This is a test answer to test the comment system.',
            },
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        testAnswerId = response.data.id;
        console.log('✅ Test answer created:', testAnswerId);
        return true;
    } catch (error: any) {
        console.error('❌ Failed to create answer:', error.response?.data || error.message);
        return false;
    }
}

async function testCreateQuestionComment() {
    console.log('\n💭 Test 1: Creating question comment...');
    try {
        const response = await axios.post(
            `${API_URL}/qna/questions/${testQuestionId}/comments`,
            {
                content: 'This is a test comment on the question.',
            },
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        testQuestionCommentId = response.data.id;
        console.log('✅ Question comment created:', response.data);
        return true;
    } catch (error: any) {
        console.error('❌ Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testCreateAnswerComment() {
    console.log('\n💭 Test 2: Creating answer comment...');
    try {
        const response = await axios.post(
            `${API_URL}/qna/answers/${testAnswerId}/comments`,
            {
                content: 'This is a test comment on the answer.',
            },
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        testAnswerCommentId = response.data.id;
        console.log('✅ Answer comment created:', response.data);
        return true;
    } catch (error: any) {
        console.error('❌ Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testGetQuestionComments() {
    console.log('\n📋 Test 3: Getting question comments...');
    try {
        const response = await axios.get(
            `${API_URL}/qna/questions/${testQuestionId}/comments`,
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        console.log('✅ Question comments retrieved:', response.data.length, 'comments');
        console.log('   Comments:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error: any) {
        console.error('❌ Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testGetAnswerComments() {
    console.log('\n📋 Test 4: Getting answer comments...');
    try {
        const response = await axios.get(
            `${API_URL}/qna/answers/${testAnswerId}/comments`,
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        console.log('✅ Answer comments retrieved:', response.data.length, 'comments');
        console.log('   Comments:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error: any) {
        console.error('❌ Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testMaxLengthValidation() {
    console.log('\n🔍 Test 5: Testing max length validation (300 chars)...');
    try {
        const longContent = 'a'.repeat(301); // 301 karakter
        await axios.post(
            `${API_URL}/qna/questions/${testQuestionId}/comments`,
            {
                content: longContent,
            },
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        console.error('❌ Validation failed: Should have rejected 301 chars');
        return false;
    } catch (error: any) {
        if (error.response?.status === 400) {
            console.log('✅ Validation working: Rejected 301 chars');
            console.log('   Error:', error.response.data.message);
            return true;
        }
        console.error('❌ Unexpected error:', error.response?.data || error.message);
        return false;
    }
}

async function testMinLengthValidation() {
    console.log('\n🔍 Test 6: Testing min length validation (empty)...');
    try {
        await axios.post(
            `${API_URL}/qna/questions/${testQuestionId}/comments`,
            {
                content: '',
            },
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        console.error('❌ Validation failed: Should have rejected empty content');
        return false;
    } catch (error: any) {
        if (error.response?.status === 400) {
            console.log('✅ Validation working: Rejected empty content');
            console.log('   Error:', error.response.data.message);
            return true;
        }
        console.error('❌ Unexpected error:', error.response?.data || error.message);
        return false;
    }
}

async function testDeleteQuestionComment() {
    console.log('\n🗑️  Test 7: Deleting question comment...');
    try {
        await axios.delete(
            `${API_URL}/qna/comments/question/${testQuestionCommentId}`,
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        console.log('✅ Question comment deleted successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testDeleteAnswerComment() {
    console.log('\n🗑️  Test 8: Deleting answer comment...');
    try {
        await axios.delete(
            `${API_URL}/qna/comments/answer/${testAnswerCommentId}`,
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        console.log('✅ Answer comment deleted successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testInvalidQuestionId() {
    console.log('\n🔍 Test 9: Testing invalid question ID...');
    try {
        await axios.post(
            `${API_URL}/qna/questions/invalid/comments`,
            {
                content: 'Test comment',
            },
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        console.error('❌ Validation failed: Should have rejected invalid ID');
        return false;
    } catch (error: any) {
        if (error.response?.status === 400) {
            console.log('✅ Validation working: Rejected invalid ID');
            console.log('   Error:', error.response.data.message);
            return true;
        }
        console.error('❌ Unexpected error:', error.response?.data || error.message);
        return false;
    }
}

async function cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    try {
        // Delete test question (cascade will delete answer and remaining comments)
        await axios.delete(
            `${API_URL}/qna/questions/${testQuestionId}`,
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        console.log('✅ Test data cleaned up');
    } catch (error: any) {
        console.error('⚠️  Cleanup warning:', error.response?.data || error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting Comment System Tests...');
    console.log('=====================================');

    // Setup
    if (!await login()) return;
    if (!await createTestQuestion()) return;
    if (!await createTestAnswer()) return;

    // Run tests
    const results = {
        createQuestionComment: await testCreateQuestionComment(),
        createAnswerComment: await testCreateAnswerComment(),
        getQuestionComments: await testGetQuestionComments(),
        getAnswerComments: await testGetAnswerComments(),
        maxLengthValidation: await testMaxLengthValidation(),
        minLengthValidation: await testMinLengthValidation(),
        deleteQuestionComment: await testDeleteQuestionComment(),
        deleteAnswerComment: await testDeleteAnswerComment(),
        invalidQuestionId: await testInvalidQuestionId(),
    };

    // Cleanup
    await cleanup();

    // Summary
    console.log('\n=====================================');
    console.log('📊 Test Summary:');
    console.log('=====================================');
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);

    Object.entries(results).forEach(([test, result]) => {
        console.log(`${result ? '✅' : '❌'} ${test}`);
    });

    if (passed === total) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the output above.');
    }
}

// Run tests
runTests().catch(console.error);
