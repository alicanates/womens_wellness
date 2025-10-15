import { registerAs } from '@nestjs/config';

/**
 * AI Configuration
 * 
 * This configuration module manages API keys for various AI providers.
 * 
 * Usage in services:
 * ```typescript
 * constructor(private readonly configService: ConfigService) {}
 * 
 * const geminiApiKey = this.configService.get<string>('ai.gemini.apiKey');
 * ```
 * 
 * Environment variables:
 * - GOOGLE_GENERATIVE_AI_API_KEY: Required for Gemini API
 * - OPENAI_API_KEY: Optional for OpenAI API
 * - ANTHROPIC_API_KEY: Optional for Anthropic API
 */
export default registerAs('ai', () => ({
    gemini: {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
    },
    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
    },
}));
