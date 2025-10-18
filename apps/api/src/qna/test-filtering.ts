/**
 * Test script for Q&A filtering, search, and sorting features
 * 
 * Tests:
 * 1. Category filtering
 * 2. Tag filtering
 * 3. Search functionality (title and content)
 * 4. Sorting options (recent, popular, unanswered)
 * 5. Combined filters
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123456!';

interface TestResult {
    name: string;
    passed: boolean;
    message: string;
}

const results: TestResult[] = [];

async function login(): Promise<string> {
    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        });
        return response.data.accessToken;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        throw error;
    }
}

async function testCategoryFiltering(token: string) {
    console.log('\n🧪 Testing category filtering...');

    try {
        // Test with PREGNANCY category
        const response = await axios.get(`${API_URL}/api/qna/questions`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { category: 'PREGNANCY' },
        });

        const allPregnancy = response.data.questions.every(q => q.category === 'PREGNANCY');

        if (allPregnancy) {
            results.push({
                name: 'Category Filtering',
                passed: true,
                message: `✅ Successfully filtered ${response.data.questions.length} questions by PREGNANCY category`,
            });
        } else {
            results.push({
                name: 'Category Filtering',
                passed: false,
                message: '❌ Some questions do not match the PREGNANCY category',
            });
        }
    } catch (error) {
        results.push({
            name: 'Category Filtering',
            passed: false,
            message: `❌ Error: ${error.response?.data?.message || error.message}`,
        });
    }
}

async function testTagFiltering(token: string) {
    console.log('\n🧪 Testing tag filtering...');

    try {
        // Test with specific tags
        const response = await axios.get(`${API_URL}/api/qna/questions`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { tags: 'hamilelik,bebek' },
        });

        const hasMatchingTags = response.data.questions.every(q =>
            q.tags.some(tag => ['hamilelik', 'bebek'].includes(tag.toLowerCase()))
        );

        if (hasMatchingTags || response.data.questions.length === 0) {
            results.push({
                name: 'Tag Filtering',
                passed: true,
                message: `✅ Successfully filtered ${response.data.questions.length} questions by tags`,
            });
        } else {
            results.push({
                name: 'Tag Filtering',
                passed: false,
                message: '❌ Some questions do not have matching tags',
            });
        }
    } catch (error) {
        results.push({
            name: 'Tag Filtering',
            passed: false,
            message: `❌ Error: ${error.response?.data?.message || error.message}`,
        });
    }
}

async function testSearchFunctionality(token: string) {
    console.log('\n🧪 Testing search functionality...');

    try {
        // Test search in title and content
        const response = await axios.get(`${API_URL}/api/qna/questions`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { search: 'hamilelik' },
        });

        const hasSearchTerm = response.data.questions.every(q =>
            q.title.toLowerCase().includes('hamilelik') ||
            q.content.toLowerCase().includes('hamilelik')
        );

        if (hasSearchTerm || response.data.questions.length === 0) {
            results.push({
                name: 'Search Functionality',
                passed: true,
                message: `✅ Successfully searched and found ${response.data.questions.length} questions`,
            });
        } else {
            results.push({
                name: 'Search Functionality',
                passed: false,
                message: '❌ Some questions do not contain the search term',
            });
        }
    } catch (error) {
        results.push({
            name: 'Search Functionality',
            passed: false,
            message: `❌ Error: ${error.response?.data?.message || error.message}`,
        });
    }
}

async function testSortingRecent(token: string) {
    console.log('\n🧪 Testing sorting by recent...');

    try {
        const response = await axios.get(`${API_URL}/api/qna/questions`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { sort: 'recent' },
        });

        // Check if questions are sorted by createdAt descending (premium first)
        let isSorted = true;
        for (let i = 0; i < response.data.questions.length - 1; i++) {
            const current = response.data.questions[i];
            const next = response.data.questions[i + 1];

            // Premium questions should come first
            if (!current.isPremium && next.isPremium) {
                isSorted = false;
                break;
            }

            // Within same premium status, check date order
            if (current.isPremium === next.isPremium) {
                const currentDate = new Date(current.createdAt);
                const nextDate = new Date(next.createdAt);
                if (currentDate < nextDate) {
                    isSorted = false;
                    break;
                }
            }
        }

        if (isSorted) {
            results.push({
                name: 'Sorting by Recent',
                passed: true,
                message: `✅ Questions are correctly sorted by recent (${response.data.questions.length} questions)`,
            });
        } else {
            results.push({
                name: 'Sorting by Recent',
                passed: false,
                message: '❌ Questions are not correctly sorted by recent',
            });
        }
    } catch (error) {
        results.push({
            name: 'Sorting by Recent',
            passed: false,
            message: `❌ Error: ${error.response?.data?.message || error.message}`,
        });
    }
}

async function testSortingPopular(token: string) {
    console.log('\n🧪 Testing sorting by popular...');

    try {
        const response = await axios.get(`${API_URL}/api/qna/questions`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { sort: 'popular' },
        });

        // Check if questions are sorted by viewCount descending (premium first)
        let isSorted = true;
        for (let i = 0; i < response.data.questions.length - 1; i++) {
            const current = response.data.questions[i];
            const next = response.data.questions[i + 1];

            // Premium questions should come first
            if (!current.isPremium && next.isPremium) {
                isSorted = false;
                break;
            }

            // Within same premium status, check view count
            if (current.isPremium === next.isPremium) {
                if (current.viewCount < next.viewCount) {
                    isSorted = false;
                    break;
                }
            }
        }

        if (isSorted) {
            results.push({
                name: 'Sorting by Popular',
                passed: true,
                message: `✅ Questions are correctly sorted by popularity (${response.data.questions.length} questions)`,
            });
        } else {
            results.push({
                name: 'Sorting by Popular',
                passed: false,
                message: '❌ Questions are not correctly sorted by popularity',
            });
        }
    } catch (error) {
        results.push({
            name: 'Sorting by Popular',
            passed: false,
            message: `❌ Error: ${error.response?.data?.message || error.message}`,
        });
    }
}

async function testSortingUnanswered(token: string) {
    console.log('\n🧪 Testing sorting by unanswered...');

    try {
        const response = await axios.get(`${API_URL}/api/qna/questions`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { sort: 'unanswered' },
        });

        // All questions should have OPEN status
        const allOpen = response.data.questions.every(q => q.status === 'OPEN');

        if (allOpen || response.data.questions.length === 0) {
            results.push({
                name: 'Sorting by Unanswered',
                passed: true,
                message: `✅ Successfully filtered ${response.data.questions.length} unanswered questions`,
            });
        } else {
            results.push({
                name: 'Sorting by Unanswered',
                passed: false,
                message: '❌ Some questions are not in OPEN status',
            });
        }
    } catch (error) {
        results.push({
            name: 'Sorting by Unanswered',
            passed: false,
            message: `❌ Error: ${error.response?.data?.message || error.message}`,
        });
    }
}

async function testCombinedFilters(token: string) {
    console.log('\n🧪 Testing combined filters...');

    try {
        // Test category + search + sort
        const response = await axios.get(`${API_URL}/api/qna/questions`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                category: 'PREGNANCY',
                search: 'bebek',
                sort: 'recent',
            },
        });

        const allMatch = response.data.questions.every(q =>
            q.category === 'PREGNANCY' &&
            (q.title.toLowerCase().includes('bebek') || q.content.toLowerCase().includes('bebek'))
        );

        if (allMatch || response.data.questions.length === 0) {
            results.push({
                name: 'Combined Filters',
                passed: true,
                message: `✅ Successfully applied combined filters (${response.data.questions.length} questions)`,
            });
        } else {
            results.push({
                name: 'Combined Filters',
                passed: false,
                message: '❌ Some questions do not match all filter criteria',
            });
        }
    } catch (error) {
        results.push({
            name: 'Combined Filters',
            passed: false,
            message: `❌ Error: ${error.response?.data?.message || error.message}`,
        });
    }
}

async function testPagination(token: string) {
    console.log('\n🧪 Testing pagination...');

    try {
        // Get first page
        const page1 = await axios.get(`${API_URL}/api/qna/questions`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: 1, limit: 5 },
        });

        // Get second page
        const page2 = await axios.get(`${API_URL}/api/qna/questions`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: 2, limit: 5 },
        });

        const hasCorrectStructure =
            page1.data.hasOwnProperty('questions') &&
            page1.data.hasOwnProperty('total') &&
            page1.data.hasOwnProperty('page') &&
            page1.data.hasOwnProperty('limit') &&
            page1.data.hasOwnProperty('hasMore');

        const noDuplicates = !page1.data.questions.some(q1 =>
            page2.data.questions.some(q2 => q1.id === q2.id)
        );

        if (hasCorrectStructure && noDuplicates) {
            results.push({
                name: 'Pagination',
                passed: true,
                message: `✅ Pagination works correctly (Page 1: ${page1.data.questions.length}, Page 2: ${page2.data.questions.length})`,
            });
        } else {
            results.push({
                name: 'Pagination',
                passed: false,
                message: '❌ Pagination has issues (duplicate items or incorrect structure)',
            });
        }
    } catch (error) {
        results.push({
            name: 'Pagination',
            passed: false,
            message: `❌ Error: ${error.response?.data?.message || error.message}`,
        });
    }
}

async function runTests() {
    console.log('🚀 Starting Q&A Filtering and Search Tests\n');
    console.log('='.repeat(60));

    try {
        // Login
        console.log('\n🔐 Logging in...');
        const token = await login();
        console.log('✅ Login successful');

        // Run all tests
        await testCategoryFiltering(token);
        await testTagFiltering(token);
        await testSearchFunctionality(token);
        await testSortingRecent(token);
        await testSortingPopular(token);
        await testSortingUnanswered(token);
        await testCombinedFilters(token);
        await testPagination(token);

        // Print results
        console.log('\n' + '='.repeat(60));
        console.log('\n📊 TEST RESULTS\n');

        const passed = results.filter(r => r.passed).length;
        const failed = results.filter(r => !r.passed).length;

        results.forEach(result => {
            console.log(result.message);
        });

        console.log('\n' + '='.repeat(60));
        console.log(`\n✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%\n`);

        if (failed > 0) {
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Test execution failed:', error.message);
        process.exit(1);
    }
}

runTests();
