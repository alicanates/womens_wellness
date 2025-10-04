/**
 * SSE (Server-Sent Events) streaming utility for AI chat
 * Based on CLAUDE.md §24.2 specifications
 */

export interface SSECallbacks {
  onToken: (token: string) => void;
  onDone?: (data?: any) => void;
  onError?: (error: Error) => void;
}

const STREAM_BUFFER_SIZE = 512; // characters
const STREAM_FLUSH_INTERVAL = 50; // ms
const MAX_BUFFER_WAIT = 200; // ms before forced flush

export class SSEClient {
  private abortController: AbortController | null = null;
  private buffer = '';
  private lastFlush = Date.now();
  private flushTimer: NodeJS.Timeout | null = null;

  async stream(url: string, token: string, callbacks: SSECallbacks) {
    this.abortController = new AbortController();
    this.buffer = '';
    this.lastFlush = Date.now();

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Stream failed');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let eventBuffer = '';

      // Flush buffer periodically
      this.flushTimer = setInterval(() => {
        if (this.buffer.length > 0) {
          this.flush(callbacks.onToken);
        }
      }, STREAM_FLUSH_INTERVAL);

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          this.flush(callbacks.onToken);
          break;
        }

        eventBuffer += decoder.decode(value, { stream: true });

        // Process complete events (separated by \n\n)
        let idx;
        while ((idx = eventBuffer.indexOf('\n\n')) >= 0) {
          const event = eventBuffer.slice(0, idx);
          eventBuffer = eventBuffer.slice(idx + 2);

          this.processEvent(event, callbacks);
        }
      }

      if (this.flushTimer) {
        clearInterval(this.flushTimer);
      }
    } catch (error: any) {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
      }

      if (error.name === 'AbortError') {
        // User cancelled
        return;
      }

      if (callbacks.onError) {
        callbacks.onError(error);
      }
    }
  }

  private processEvent(eventStr: string, callbacks: SSECallbacks) {
    const lines = eventStr.split('\n');
    let eventType = 'message';
    let data = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7);
      } else if (line.startsWith('data: ')) {
        data = line.slice(6);
      }
    }

    if (!data) return;

    switch (eventType) {
      case 'token':
        this.addToBuffer(data, callbacks.onToken);
        break;

      case 'done':
        this.flush(callbacks.onToken);
        if (callbacks.onDone) {
          try {
            const parsed = JSON.parse(data);
            callbacks.onDone(parsed);
          } catch {
            callbacks.onDone();
          }
        }
        break;

      case 'error':
        if (callbacks.onError) {
          try {
            const error = JSON.parse(data);
            callbacks.onError(new Error(error.message || 'Stream error'));
          } catch {
            callbacks.onError(new Error(data));
          }
        }
        break;
    }
  }

  private addToBuffer(token: string, onToken: (token: string) => void) {
    this.buffer += token;

    const now = Date.now();
    const timeSinceFlush = now - this.lastFlush;

    // Flush if buffer is full or max wait exceeded
    if (
      this.buffer.length >= STREAM_BUFFER_SIZE ||
      timeSinceFlush >= MAX_BUFFER_WAIT
    ) {
      this.flush(onToken);
    }
  }

  private flush(onToken: (token: string) => void) {
    if (this.buffer.length > 0) {
      onToken(this.buffer);
      this.buffer = '';
      this.lastFlush = Date.now();
    }
  }

  stop() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
