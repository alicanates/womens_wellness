/**
 * SSE (Server-Sent Events) streaming utility for AI chat
 * Based on CLAUDE.md §24.2 specifications
 * 
 * Buffer Management:
 * - Buffer Size: 512 characters (optimal for smooth streaming)
 * - Flush Interval: 50ms (matches ~20 FPS for smooth visual updates)
 * - Max Buffer Wait: 200ms (ensures low perceived latency)
 * 
 * See SSE_BUFFER_OPTIMIZATION.md for detailed documentation
 */

export interface SSECallbacks {
  onToken: (token: string) => void;
  onDone?: (data?: any) => void;
  onError?: (error: Error) => void;
}

// Buffer configuration - optimized for chat streaming performance
const STREAM_BUFFER_SIZE = 512; // characters - balances latency vs efficiency
const STREAM_FLUSH_INTERVAL = 50; // ms - matches human perception threshold
const MAX_BUFFER_WAIT = 200; // ms - prevents noticeable delay

export class SSEClient {
  private xhr: XMLHttpRequest | null = null;
  private buffer = '';
  private lastFlush = Date.now();
  private flushTimer: NodeJS.Timeout | null = null;

  async stream(url: string, token: string, callbacks: SSECallbacks) {
    return new Promise<void>((resolve, reject) => {
      this.xhr = new XMLHttpRequest();
      let eventBuffer = '';

      this.buffer = '';
      this.lastFlush = Date.now();

      // Flush buffer periodically
      this.flushTimer = setInterval(() => {
        if (this.buffer.length > 0) {
          this.flush(callbacks.onToken);
        }
      }, STREAM_FLUSH_INTERVAL);

      this.xhr.open('GET', url, true);
      this.xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      this.xhr.setRequestHeader('Accept', 'text/event-stream');
      this.xhr.setRequestHeader('Cache-Control', 'no-cache');

      let lastIndex = 0;

      this.xhr.onprogress = () => {
        if (!this.xhr) return;

        const newData = this.xhr.responseText.substring(lastIndex);
        lastIndex = this.xhr.responseText.length;

        console.log('[SSE] Progress - new data length:', newData.length);

        eventBuffer += newData;

        // Process complete events (separated by \n\n)
        let idx;
        while ((idx = eventBuffer.indexOf('\n\n')) >= 0) {
          const event = eventBuffer.slice(0, idx);
          eventBuffer = eventBuffer.slice(idx + 2);

          console.log('[SSE] Processing event:', event.substring(0, 100));
          this.processEvent(event, callbacks);
        }
      };

      this.xhr.onload = () => {
        if (this.flushTimer) {
          clearInterval(this.flushTimer);
          this.flushTimer = null;
        }

        if (!this.xhr) return;

        // Process any remaining data
        if (eventBuffer.trim()) {
          this.processEvent(eventBuffer, callbacks);
        }

        this.flush(callbacks.onToken);

        if (this.xhr.status >= 200 && this.xhr.status < 300) {
          resolve();
        } else {
          let errorMessage = 'Stream failed';

          try {
            const contentType = this.xhr.getResponseHeader('content-type');
            if (contentType && contentType.includes('application/json')) {
              const error = JSON.parse(this.xhr.responseText);
              errorMessage = error.message || errorMessage;
            } else {
              errorMessage = this.xhr.responseText || this.xhr.statusText || errorMessage;
            }
          } catch {
            errorMessage = this.xhr.statusText || errorMessage;
          }

          // Add status code context for specific errors
          if (this.xhr.status === 403) {
            reject(new Error(errorMessage));
          } else if (this.xhr.status === 429) {
            reject(new Error(errorMessage));
          } else if (this.xhr.status === 401) {
            reject(new Error('Oturum süresi doldu, lütfen tekrar giriş yapın'));
          } else if (this.xhr.status >= 500) {
            reject(new Error('Sunucu hatası: ' + errorMessage));
          } else {
            reject(new Error(errorMessage));
          }
        }
      };

      this.xhr.onerror = () => {
        if (this.flushTimer) {
          clearInterval(this.flushTimer);
          this.flushTimer = null;
        }

        const error = new Error('Bağlantı hatası, internet bağlantınızı kontrol edin');
        if (callbacks.onError) {
          callbacks.onError(error);
        }
        reject(error);
      };

      this.xhr.onabort = () => {
        if (this.flushTimer) {
          clearInterval(this.flushTimer);
          this.flushTimer = null;
        }
        resolve();
      };

      this.xhr.send();
    });
  }

  private processEvent(eventStr: string, callbacks: SSECallbacks) {
    const lines = eventStr.split('\n');
    let eventType = 'message';
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7);
      } else if (line.startsWith('data: ')) {
        dataLines.push(line.slice(6));
      }
    }

    if (dataLines.length === 0) return;

    // Join multiple data lines with newline
    const data = dataLines.join('\n');

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

    if (this.xhr) {
      this.xhr.abort();
      this.xhr = null;
    }
  }
}
