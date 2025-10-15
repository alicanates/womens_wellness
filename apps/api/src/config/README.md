# Configuration Module

This directory contains configuration modules for the application.

## AI Configuration (`ai.config.ts`)

Manages API keys and settings for AI providers used in the chat functionality.

### Environment Variables

| Variable | Required | Description | How to Get |
|----------|----------|-------------|------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | ✅ Yes | Google Gemini API key for chat functionality | [Get API Key](https://aistudio.google.com/app/apikey) |
| `OPENAI_API_KEY` | ❌ No | OpenAI API key (optional, for future use) | [OpenAI Platform](https://platform.openai.com/api-keys) |
| `ANTHROPIC_API_KEY` | ❌ No | Anthropic API key (optional, for future use) | [Anthropic Console](https://console.anthropic.com/) |

### Usage in Services

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YourService {
  constructor(private readonly configService: ConfigService) {}

  someMethod() {
    // Access Gemini API key
    const geminiApiKey = this.configService.get<string>('ai.gemini.apiKey');
    
    // Access OpenAI API key
    const openaiApiKey = this.configService.get<string>('ai.openai.apiKey');
    
    // Access Anthropic API key
    const anthropicApiKey = this.configService.get<string>('ai.anthropic.apiKey');
  }
}
```

### Validation

The application validates the presence of `GOOGLE_GENERATIVE_AI_API_KEY` during bootstrap in `main.ts`. If the key is missing or contains a placeholder value, the application will exit with an error message.

### Setup Instructions

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

3. Update `.env.local` with your actual API key:
   ```bash
   GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
   ```

4. Start the application:
   ```bash
   pnpm dev
   ```

### Error Messages

If the API key is not configured properly, you'll see:

```
❌ Missing or invalid required environment variables:
   - GOOGLE_GENERATIVE_AI_API_KEY

💡 Please check your .env.local file and ensure all required variables are set.
```
