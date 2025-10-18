/**
 * Utility functions for input sanitization and XSS protection
 */

/**
 * Remove HTML tags and potentially dangerous characters
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(input: string): string {
    if (!input) return '';

    return input
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove script tags and content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove event handlers
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        // Remove javascript: protocol
        .replace(/javascript:/gi, '')
        // Remove data: protocol
        .replace(/data:/gi, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Sanitize array of strings
 * @param input - Array of strings to sanitize
 * @returns Sanitized array
 */
export function sanitizeArray(input: string[]): string[] {
    if (!Array.isArray(input)) return [];

    return input
        .map((item) => sanitizeHtml(item))
        .filter((item) => item.length > 0)
        .slice(0, 5); // Max 5 items
}

/**
 * Check if content contains spam patterns
 * @param content - Content to check
 * @returns True if spam detected
 */
export function detectSpam(content: string): boolean {
    if (!content) return false;

    const spamPatterns = [
        // Excessive URLs
        /(https?:\/\/[^\s]+){3,}/gi,
        // Excessive capitalization
        /[A-Z]{10,}/g,
        // Excessive punctuation
        /[!?]{5,}/g,
        // Common spam words (Turkish)
        /\b(kazanç|para kazan|tıkla|bedava|ücretsiz|hemen|acele|şimdi)\b/gi,
        // Excessive emojis
        /([\u{1F600}-\u{1F64F}]){5,}/gu,
    ];

    return spamPatterns.some((pattern) => pattern.test(content));
}

/**
 * Validate and sanitize question title
 * @param title - Question title
 * @returns Sanitized title
 */
export function sanitizeQuestionTitle(title: string): string {
    const sanitized = sanitizeHtml(title);

    // Additional validation
    if (sanitized.length < 10) {
        throw new Error('Soru başlığı en az 10 karakter olmalıdır');
    }

    if (sanitized.length > 200) {
        throw new Error('Soru başlığı en fazla 200 karakter olabilir');
    }

    return sanitized;
}

/**
 * Validate and sanitize content (question/answer)
 * @param content - Content to sanitize
 * @returns Sanitized content
 */
export function sanitizeContent(content: string): string {
    const sanitized = sanitizeHtml(content);

    // Additional validation
    if (sanitized.length < 20) {
        throw new Error('İçerik en az 20 karakter olmalıdır');
    }

    if (sanitized.length > 5000) {
        throw new Error('İçerik en fazla 5000 karakter olabilir');
    }

    // Check for spam
    if (detectSpam(sanitized)) {
        throw new Error('İçeriğiniz spam olarak algılandı');
    }

    return sanitized;
}

/**
 * Validate and sanitize comment
 * @param comment - Comment to sanitize
 * @returns Sanitized comment
 */
export function sanitizeComment(comment: string): string {
    const sanitized = sanitizeHtml(comment);

    // Additional validation
    if (sanitized.length < 1) {
        throw new Error('Yorum boş olamaz');
    }

    if (sanitized.length > 300) {
        throw new Error('Yorum en fazla 300 karakter olabilir');
    }

    return sanitized;
}

/**
 * Validate and sanitize tags
 * @param tags - Array of tags
 * @returns Sanitized tags
 */
export function sanitizeTags(tags: string[]): string[] {
    if (!tags || !Array.isArray(tags)) return [];

    return tags
        .map((tag) => sanitizeHtml(tag))
        .filter((tag) => tag.length > 0 && tag.length <= 30)
        .slice(0, 5); // Max 5 tags
}

/**
 * Escape special characters for database queries
 * @param input - String to escape
 * @returns Escaped string
 */
export function escapeSpecialChars(input: string): string {
    if (!input) return '';

    return input
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}
