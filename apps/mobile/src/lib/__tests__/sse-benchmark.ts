/**
 * SSE Client Buffer Performance Benchmark
 * Run this to validate buffer settings are optimal
 * 
 * Usage: npx ts-node apps/mobile/src/lib/__tests__/sse-benchmark.ts
 */

import { SSEClient } from '../sse';

interface BenchmarkResult {
    scenario: string;
    totalTokens: number;
    flushCount: number;
    avgFlushSize: number;
    duration: number;
    tokensPerSecond: number;
}

class SSEBenchmark {
    async runBenchmark(scenario: string, tokens: string[]): Promise<BenchmarkResult> {
        const sseClient = new SSEClient();
        let flushCount = 0;
        let totalChars = 0;
        const startTime = Date.now();

        // Mock fetch to simulate streaming
        const mockReader = this.createMockStreamReader(tokens);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            body: { getReader: () => mockReader },
        });

        await sseClient.stream('http://test.com', 'token', {
            onToken: (chunk) => {
                flushCount++;
                totalChars += chunk.length;
            },
            onDone: () => { },
        });

        const duration = Date.now() - startTime;
        const avgFlushSize = totalChars / flushCount;
        const tokensPerSecond = (tokens.length / duration) * 1000;

        return {
            scenario,
            totalTokens: tokens.length,
            flushCount,
            avgFlushSize: Math.round(avgFlushSize),
            duration,
            tokensPerSecond: Math.round(tokensPerSecond),
        };
    }

    private createMockStreamReader(tokens: string[]) {
        let index = 0;
        const encoder = new TextEncoder();

        return {
            read: async () => {
                if (index >= tokens.length) {
                    const doneEvent = `event: done\ndata: {}\n\n`;
                    return { value: encoder.encode(doneEvent), done: false };
                }
                if (index === tokens.length) {
                    return { value: undefined, done: true };
                }
                const event = `event: token\ndata: ${tokens[index++]}\n\n`;
                return { value: encoder.encode(event), done: false };
            },
        };
    }

    printResults(results: BenchmarkResult[]) {
        console.log('\n=== SSE Buffer Performance Benchmark ===\n');
        console.log('Current Settings:');
        console.log('  - Buffer Size: 512 characters');
        console.log('  - Flush Interval: 50ms');
        console.log('  - Max Buffer Wait: 200ms\n');

        console.log('Results:\n');
        results.forEach(result => {
            console.log(`Scenario: ${result.scenario}`);
            console.log(`  Total Tokens: ${result.totalTokens}`);
            console.log(`  Flush Count: ${result.flushCount}`);
            console.log(`  Avg Flush Size: ${result.avgFlushSize} chars`);
            console.log(`  Duration: ${result.duration}ms`);
            console.log(`  Throughput: ${result.tokensPerSecond} tokens/sec`);
            console.log('');
        });

        // Analysis
        console.log('Analysis:');
        const avgFlushSize = results.reduce((sum, r) => sum + r.avgFlushSize, 0) / results.length;
        console.log(`  - Average flush size across scenarios: ${Math.round(avgFlushSize)} chars`);

        if (avgFlushSize > 400 && avgFlushSize < 600) {
            console.log('  ✅ Buffer size (512) is optimal');
        } else if (avgFlushSize < 200) {
            console.log('  ⚠️  Consider reducing buffer size for lower latency');
        } else if (avgFlushSize > 700) {
            console.log('  ⚠️  Consider increasing buffer size for better efficiency');
        }

        const avgThroughput = results.reduce((sum, r) => sum + r.tokensPerSecond, 0) / results.length;
        console.log(`  - Average throughput: ${Math.round(avgThroughput)} tokens/sec`);

        if (avgThroughput > 100) {
            console.log('  ✅ Throughput is excellent');
        } else if (avgThroughput > 50) {
            console.log('  ✅ Throughput is good');
        } else {
            console.log('  ⚠️  Throughput could be improved');
        }
    }
}

// Run benchmarks
async function main() {
    const benchmark = new SSEBenchmark();
    const results: BenchmarkResult[] = [];

    // Scenario 1: Small tokens (typical chat response)
    console.log('Running Scenario 1: Small tokens...');
    const smallTokens = Array(500).fill(null).map(() =>
        ['Hello', ' ', 'world', '!', '\n'][Math.floor(Math.random() * 5)]
    );
    results.push(await benchmark.runBenchmark('Small tokens (chat)', smallTokens));

    // Scenario 2: Medium tokens (code snippets)
    console.log('Running Scenario 2: Medium tokens...');
    const mediumTokens = Array(200).fill(null).map(() =>
        'const x = ' + Math.random().toString(36).substring(7) + ';\n'
    );
    results.push(await benchmark.runBenchmark('Medium tokens (code)', mediumTokens));

    // Scenario 3: Large tokens (paragraphs)
    console.log('Running Scenario 3: Large tokens...');
    const largeTokens = Array(50).fill(null).map(() =>
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(5)
    );
    results.push(await benchmark.runBenchmark('Large tokens (paragraphs)', largeTokens));

    // Scenario 4: Mixed tokens (realistic)
    console.log('Running Scenario 4: Mixed tokens...');
    const mixedTokens = [
        ...Array(100).fill('a'),
        ...Array(50).fill('word '),
        ...Array(20).fill('This is a longer sentence. '),
        ...Array(10).fill('x'.repeat(100)),
    ];
    results.push(await benchmark.runBenchmark('Mixed tokens (realistic)', mixedTokens));

    benchmark.printResults(results);
}

// Only run if executed directly
if (require.main === module) {
    main().catch(console.error);
}

export { SSEBenchmark };
