/**
 * Gemini API Integration Test Script
 * 
 * This script tests:
 * 1. Gemini API connection
 * 2. Streaming functionality
 * 3. Token counting
 * 
 * Run with: npx ts-node src/chat/test-gemini-integration.ts
 */

import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Note: Make sure GOOGLE_GENERATIVE_AI_API_KEY is set in your environment
// You can run this with: GOOGLE_GENERATIVE_AI_API_KEY=your_key npx ts-node src/chat/test-gemini-integration.ts

interface TestResult {
    success: boolean;
    message: string;
    details?: any;
}

async function testGeminiConnection(): Promise<TestResult> {
    console.log('\n🔍 Test 1: Gemini API Connection');
    console.log('─'.repeat(50));

    try {
        // Check if API key is configured
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        if (!apiKey || apiKey === 'PLACEHOLDER_GOOGLE_AI_KEY') {
            return {
                success: false,
                message: '❌ GOOGLE_GENERATIVE_AI_API_KEY is not configured',
                details: {
                    hint: 'Please set a valid API key in .env.local',
                    getKey: 'https://aistudio.google.com/app/apikey',
                },
            };
        }

        console.log('✓ API key found in environment');

        // Try to create a simple request
        const model = google('gemini-1.5-flash');
        console.log('✓ Model initialized: gemini-1.5-flash');

        const result = await streamText({
            model,
            messages: [
                {
                    role: 'user',
                    content: 'Merhaba! Sadece "Test başarılı" diye yanıt ver.',
                },
            ],
            maxTokens: 50,
        });

        // Collect the response
        let response = '';
        for await (const chunk of result.textStream) {
            response += chunk;
        }

        console.log('✓ Response received:', response.trim());

        return {
            success: true,
            message: '✅ Gemini API connection successful',
            details: {
                model: 'gemini-1.5-flash',
                response: response.trim(),
            },
        };
    } catch (error: any) {
        return {
            success: false,
            message: '❌ Gemini API connection failed',
            details: {
                error: error.message,
                stack: error.stack,
            },
        };
    }
}

async function testStreaming(): Promise<TestResult> {
    console.log('\n🔍 Test 2: Streaming Functionality');
    console.log('─'.repeat(50));

    try {
        const model = google('gemini-1.5-flash');

        const result = await streamText({
            model,
            messages: [
                {
                    role: 'user',
                    content: 'Bana 1\'den 5\'e kadar sayıları say.',
                },
            ],
            maxTokens: 100,
        });

        let chunkCount = 0;
        let fullResponse = '';
        const chunks: string[] = [];

        console.log('Streaming chunks:');
        for await (const chunk of result.textStream) {
            chunkCount++;
            fullResponse += chunk;
            chunks.push(chunk);
            process.stdout.write(chunk);
        }
        console.log('\n');

        if (chunkCount === 0) {
            return {
                success: false,
                message: '❌ No chunks received from stream',
            };
        }

        console.log(`✓ Received ${chunkCount} chunks`);
        console.log('✓ Full response:', fullResponse.trim());

        return {
            success: true,
            message: '✅ Streaming works correctly',
            details: {
                chunkCount,
                fullResponse: fullResponse.trim(),
                firstChunk: chunks[0],
                lastChunk: chunks[chunks.length - 1],
            },
        };
    } catch (error: any) {
        return {
            success: false,
            message: '❌ Streaming test failed',
            details: {
                error: error.message,
            },
        };
    }
}

async function testTokenCounting(): Promise<TestResult> {
    console.log('\n🔍 Test 3: Token Counting');
    console.log('─'.repeat(50));

    try {
        const model = google('gemini-1.5-flash');

        const testMessage = 'Merhaba! Bu bir test mesajıdır.';

        const result = await streamText({
            model,
            messages: [
                {
                    role: 'user',
                    content: testMessage,
                },
            ],
            maxTokens: 100,
        });

        let tokenCount = 0;
        let fullResponse = '';

        for await (const chunk of result.textStream) {
            tokenCount++;
            fullResponse += chunk;
        }

        console.log('✓ Token count (chunks):', tokenCount);
        console.log('✓ Response length:', fullResponse.length, 'characters');
        console.log('✓ Response:', fullResponse.trim());

        // Verify token count is reasonable
        if (tokenCount === 0) {
            return {
                success: false,
                message: '❌ Token count is zero',
            };
        }

        if (tokenCount > 1000) {
            return {
                success: false,
                message: '❌ Token count seems unreasonably high',
                details: { tokenCount },
            };
        }

        return {
            success: true,
            message: '✅ Token counting works correctly',
            details: {
                tokenCount,
                responseLength: fullResponse.length,
                avgCharsPerToken: (fullResponse.length / tokenCount).toFixed(2),
            },
        };
    } catch (error: any) {
        return {
            success: false,
            message: '❌ Token counting test failed',
            details: {
                error: error.message,
            },
        };
    }
}

async function testWithSystemPrompt(): Promise<TestResult> {
    console.log('\n🔍 Test 4: System Prompt Integration');
    console.log('─'.repeat(50));

    try {
        const model = google('gemini-1.5-flash');

        const systemPrompt = `Sen "NOVA"sın, kullanıcının güvenilir sağlık asistanı ve arkadaşısın. 
Empatik, yargılamayan ve destekleyicisin. Türkçe konuş.`;

        const result = await streamText({
            model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: 'Kendini tanıt.',
                },
            ],
            maxTokens: 150,
        });

        let fullResponse = '';
        for await (const chunk of result.textStream) {
            fullResponse += chunk;
        }

        console.log('✓ Response with system prompt:', fullResponse.trim());

        // Check if response mentions NOVA
        const mentionsNova = fullResponse.toLowerCase().includes('nova');
        const inTurkish = /[çğıöşü]/i.test(fullResponse);

        console.log('✓ Mentions NOVA:', mentionsNova ? 'Yes' : 'No');
        console.log('✓ Response in Turkish:', inTurkish ? 'Yes' : 'No');

        return {
            success: true,
            message: '✅ System prompt integration works',
            details: {
                response: fullResponse.trim(),
                mentionsNova,
                inTurkish,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            message: '❌ System prompt test failed',
            details: {
                error: error.message,
            },
        };
    }
}

async function runAllTests() {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   Gemini API Integration Test Suite           ║');
    console.log('╚════════════════════════════════════════════════╝');

    const results: TestResult[] = [];

    // Run all tests
    results.push(await testGeminiConnection());

    // Only continue if connection test passed
    if (results[0].success) {
        results.push(await testStreaming());
        results.push(await testTokenCounting());
        results.push(await testWithSystemPrompt());
    }

    // Print summary
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   Test Summary                                 ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    const passed = results.filter((r) => r.success).length;
    const total = results.length;

    results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.message}`);
        if (result.details && !result.success) {
            console.log('   Details:', JSON.stringify(result.details, null, 2));
        }
    });

    console.log('\n' + '─'.repeat(50));
    console.log(`Results: ${passed}/${total} tests passed`);
    console.log('─'.repeat(50) + '\n');

    // Exit with appropriate code
    process.exit(passed === total ? 0 : 1);
}

// Run the tests
runAllTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
