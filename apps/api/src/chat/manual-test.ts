/**
 * Manual Gemini API Test
 * 
 * This is a simple script to manually test the Gemini API integration.
 * 
 * Usage:
 * 1. Set your API key: export GOOGLE_GENERATIVE_AI_API_KEY=your_key
 * 2. Run: npx ts-node src/chat/manual-test.ts
 */

import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

async function main() {
    console.log('🧪 Testing Gemini API Integration\n');

    // Check API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey || apiKey === 'PLACEHOLDER_GOOGLE_AI_KEY') {
        console.error('❌ Error: GOOGLE_GENERATIVE_AI_API_KEY not set');
        console.log('\nTo fix this:');
        console.log('1. Get an API key from: https://aistudio.google.com/app/apikey');
        console.log('2. Set it in .env.local or export it:');
        console.log('   export GOOGLE_GENERATIVE_AI_API_KEY=your_key_here');
        console.log('3. Run this script again\n');
        process.exit(1);
    }

    console.log('✓ API key found\n');

    try {
        // Test 1: Simple message
        console.log('Test 1: Simple message');
        console.log('─'.repeat(50));

        const model = google('gemini-1.5-flash');
        const result = await streamText({
            model,
            messages: [
                { role: 'user', content: 'Say "Hello from Gemini!" in Turkish' },
            ],
            maxTokens: 50,
        });

        let response = '';
        let chunks = 0;

        process.stdout.write('Response: ');
        for await (const chunk of result.textStream) {
            response += chunk;
            chunks++;
            process.stdout.write(chunk);
        }
        console.log('\n');
        console.log(`✓ Received ${chunks} chunks`);
        console.log(`✓ Total length: ${response.length} characters\n`);

        // Test 2: With system prompt
        console.log('Test 2: With system prompt (NOVA personality)');
        console.log('─'.repeat(50));

        const result2 = await streamText({
            model,
            messages: [
                {
                    role: 'system',
                    content: 'Sen NOVA\'sın, kullanıcının sağlık asistanı. Türkçe konuş.'
                },
                { role: 'user', content: 'Kendini tanıt' },
            ],
            maxTokens: 100,
        });

        let response2 = '';
        process.stdout.write('Response: ');
        for await (const chunk of result2.textStream) {
            response2 += chunk;
            process.stdout.write(chunk);
        }
        console.log('\n');

        // Test 3: Token counting
        console.log('Test 3: Token counting');
        console.log('─'.repeat(50));

        const result3 = await streamText({
            model,
            messages: [
                { role: 'user', content: 'Count from 1 to 5' },
            ],
            maxTokens: 50,
        });

        let tokenCount = 0;
        for await (const chunk of result3.textStream) {
            tokenCount++;
        }

        console.log(`✓ Token count: ${tokenCount}\n`);

        console.log('✅ All tests passed!\n');
        console.log('Next steps:');
        console.log('- Update .env.local with your API key');
        console.log('- Run the full test suite: npx ts-node src/chat/test-gemini-integration.ts');
        console.log('- Test with the actual API endpoints\n');

    } catch (error: any) {
        console.error('❌ Test failed:', error.message);

        if (error.message?.includes('API key')) {
            console.log('\nThe API key might be invalid. Please check:');
            console.log('- https://aistudio.google.com/app/apikey');
        } else if (error.message?.includes('rate limit')) {
            console.log('\nRate limit exceeded. Please wait a few minutes and try again.');
        } else {
            console.log('\nFull error:', error);
        }

        process.exit(1);
    }
}

main();
