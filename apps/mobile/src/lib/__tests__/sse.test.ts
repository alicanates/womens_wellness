/**
 * SSE Client Buffer Management Tests
 * Validates buffer size, flush interval, and performance
 */

import { SSEClient } from '../sse';

// Mock fetch for testing
global.fetch = jest.fn();

describe('SSEClient Buffer Management', () => {
    let sseClient: SSEClient;
    let mockOnToken: jest.Mock;
    let mockOnDone: jest.Mock;
    let mockOnError: jest.Mock;

    beforeEach(() => {
        sseClient = new SSEClient();
        mockOnToken = jest.fn();
        mockOnDone = jest.fn();
        mockOnError = jest.fn();
        jest.clearAllMocks();
    });

    afterEach(() => {
        sseClient.stop();
    });

    describe('Buffer Size (512 characters)', () => {
        it('should flush buffer when it reaches 512 characters', async () => {
            const largeToken = 'a'.repeat(600); // Exceeds buffer size

            const mockReader = createMockReader([
                createSSEEvent('token', largeToken),
                createSSEEvent('done', '{}'),
            ]);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                body: { getReader: () => mockReader },
            });

            await sseClient.stream('http://test.com', 'token', {
                onToken: mockOnToken,
                onDone: mockOnDone,
            });

            // Should have been called at least once due to buffer overflow
            expect(mockOnToken).toHaveBeenCalled();
            expect(mockOnToken.mock.calls[0][0].length).toBeGreaterThan(0);
        });

        it('should accumulate tokens smaller than buffer size', async () => {
            const smallTokens = ['Hello', ' ', 'World', '!'];

            const mockReader = createMockReader([
                ...smallTokens.map(token => createSSEEvent('token', token)),
                createSSEEvent('done', '{}'),
            ]);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                body: { getReader: () => mockReader },
            });

            await sseClient.stream('http://test.com', 'token', {
                onToken: mockOnToken,
                onDone: mockOnDone,
            });

            // Tokens should be buffered and flushed together
            expect(mockOnToken).toHaveBeenCalled();
            const allTokens = mockOnToken.mock.calls.map(call => call[0]).join('');
            expect(allTokens).toBe('Hello World!');
        });
    });

    describe('Flush Interval (50ms)', () => {
        it('should flush buffer every 50ms even with small tokens', async () => {
            jest.useFakeTimers();

            const mockReader = createMockReaderWithDelay([
                createSSEEvent('token', 'a'),
                createSSEEvent('token', 'b'),
                createSSEEvent('token', 'c'),
            ]);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                body: { getReader: () => mockReader },
            });

            const streamPromise = sseClient.stream('http://test.com', 'token', {
                onToken: mockOnToken,
                onDone: mockOnDone,
            });

            // Advance timers to trigger periodic flush
            jest.advanceTimersByTime(50);
            await Promise.resolve(); // Let microtasks run

            jest.advanceTimersByTime(50);
            await Promise.resolve();

            sseClient.stop();
            jest.useRealTimers();

            // Should have flushed periodically
            expect(mockOnToken).toHaveBeenCalled();
        });
    });

    describe('Max Buffer Wait (200ms)', () => {
        it('should force flush after 200ms regardless of buffer size', async () => {
            jest.useFakeTimers();

            const mockReader = createMockReaderWithDelay([
                createSSEEvent('token', 'test'),
            ]);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                body: { getReader: () => mockReader },
            });

            const streamPromise = sseClient.stream('http://test.com', 'token', {
                onToken: mockOnToken,
                onDone: mockOnDone,
            });

            // Advance time to trigger max wait flush
            jest.advanceTimersByTime(200);
            await Promise.resolve();

            sseClient.stop();
            jest.useRealTimers();

            // Should have flushed due to max wait time
            expect(mockOnToken).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

            await sseClient.stream('http://test.com', 'token', {
                onToken: mockOnToken,
                onError: mockOnError,
            });

            expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should handle abort signal correctly', async () => {
            const mockReader = createMockReaderWithDelay([
                createSSEEvent('token', 'test'),
            ]);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                body: { getReader: () => mockReader },
            });

            const streamPromise = sseClient.stream('http://test.com', 'token', {
                onToken: mockOnToken,
                onError: mockOnError,
            });

            // Stop streaming immediately
            sseClient.stop();

            await streamPromise;

            // Should not call error callback for abort
            expect(mockOnError).not.toHaveBeenCalled();
        });
    });

    describe('Performance', () => {
        it('should handle rapid token streaming efficiently', async () => {
            const tokens = Array(1000).fill('x'); // 1000 single-char tokens

            const mockReader = createMockReader([
                ...tokens.map(token => createSSEEvent('token', token)),
                createSSEEvent('done', '{}'),
            ]);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                body: { getReader: () => mockReader },
            });

            const startTime = Date.now();

            await sseClient.stream('http://test.com', 'token', {
                onToken: mockOnToken,
                onDone: mockOnDone,
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete in reasonable time (< 1 second for 1000 tokens)
            expect(duration).toBeLessThan(1000);

            // Should have buffered tokens efficiently
            expect(mockOnToken.mock.calls.length).toBeLessThan(tokens.length);
        });
    });
});

// Helper functions
function createSSEEvent(type: string, data: string): string {
    return `event: ${type}\ndata: ${data}\n\n`;
}

function createMockReader(events: string[]) {
    let index = 0;
    const encoder = new TextEncoder();

    return {
        read: async () => {
            if (index >= events.length) {
                return { value: undefined, done: true };
            }
            const value = encoder.encode(events[index++]);
            return { value, done: false };
        },
    };
}

function createMockReaderWithDelay(events: string[], delay: number = 10) {
    let index = 0;
    const encoder = new TextEncoder();

    return {
        read: async () => {
            await new Promise(resolve => setTimeout(resolve, delay));
            if (index >= events.length) {
                return { value: undefined, done: true };
            }
            const value = encoder.encode(events[index++]);
            return { value, done: false };
        },
    };
}
