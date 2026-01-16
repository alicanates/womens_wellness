#!/usr/bin/env ts-node
/**
 * Environment Variables Validation Script
 * 
 * Bu script production deployment öncesi environment variables'ları kontrol eder.
 * 
 * Kullanım:
 *   pnpm validate:env
 *   NODE_ENV=production pnpm validate:env
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env';

const envPath = path.resolve(__dirname, '..', envFile);

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ Loaded environment from: ${envFile}\n`);
} else {
    console.error(`❌ Environment file not found: ${envFile}`);
    process.exit(1);
}

interface ValidationRule {
    key: string;
    required: boolean;
    level: 'critical' | 'important' | 'optional';
    description: string;
    validate?: (value: string) => boolean;
    errorMessage?: string;
    placeholders?: string[];
}

const validationRules: ValidationRule[] = [
    // ─── Critical: Database & Cache ───
    {
        key: 'DATABASE_URL',
        required: true,
        level: 'critical',
        description: 'PostgreSQL connection string',
        validate: (v) => v.startsWith('postgresql://') && !v.includes('CHANGE_ME'),
        errorMessage: 'Must be a valid PostgreSQL URL',
        placeholders: ['CHANGE_ME'],
    },
    {
        key: 'REDIS_URL',
        required: true,
        level: 'critical',
        description: 'Redis connection string',
        validate: (v) => v.startsWith('redis://') && !v.includes('CHANGE_ME'),
        errorMessage: 'Must be a valid Redis URL',
        placeholders: ['CHANGE_ME'],
    },

    // ─── Critical: Auth & Security ───
    {
        key: 'JWT_SECRET',
        required: true,
        level: 'critical',
        description: 'JWT access token secret',
        validate: (v) => v.length >= 32 && !v.includes('GENERATE_WITH_OPENSSL'),
        errorMessage: 'Must be at least 32 characters (use: openssl rand -hex 32)',
        placeholders: ['GENERATE_WITH_OPENSSL', '__GENERATE_WITH_OPENSSL__'],
    },
    {
        key: 'JWT_REFRESH_SECRET',
        required: true,
        level: 'critical',
        description: 'JWT refresh token secret',
        validate: (v) => v.length >= 32 && !v.includes('GENERATE_WITH_OPENSSL'),
        errorMessage: 'Must be at least 32 characters and different from JWT_SECRET',
        placeholders: ['GENERATE_WITH_OPENSSL', '__GENERATE_WITH_OPENSSL__'],
    },
    {
        key: 'ADMIN_EMAILS',
        required: true,
        level: 'critical',
        description: 'Admin email addresses',
        validate: (v) => v.includes('@') && !v.includes('test@test.com'),
        errorMessage: 'Must contain valid email addresses',
    },
    {
        key: 'SKIP_WEBHOOK_VERIFICATION',
        required: true,
        level: 'critical',
        description: 'Webhook verification flag',
        validate: (v) => process.env.NODE_ENV !== 'production' || v === 'false',
        errorMessage: 'Must be "false" in production!',
    },
    {
        key: 'GOOGLE_PUBSUB_PUSH_TOKEN',
        required: true,
        level: 'critical',
        description: 'Google Pub/Sub push token',
        validate: (v) => v.length >= 32 && !v.includes('GENERATE_WITH_OPENSSL'),
        errorMessage: 'Must be a strong random token (use: openssl rand -hex 32)',
        placeholders: ['GENERATE_WITH_OPENSSL', '__GENERATE_WITH_OPENSSL__'],
    },

    // ─── Critical: Google OAuth ───
    {
        key: 'GOOGLE_OAUTH_CLIENT_ID_IOS',
        required: true,
        level: 'critical',
        description: 'Google OAuth iOS Client ID',
        validate: (v) => v.includes('.apps.googleusercontent.com') && !v.includes('PLACEHOLDER'),
        errorMessage: 'Must be a valid Google OAuth Client ID',
        placeholders: ['PLACEHOLDER_GOOGLE_CLIENT_IOS'],
    },
    {
        key: 'GOOGLE_OAUTH_CLIENT_ID_ANDROID',
        required: true,
        level: 'critical',
        description: 'Google OAuth Android Client ID',
        validate: (v) => v.includes('.apps.googleusercontent.com') && !v.includes('PLACEHOLDER'),
        errorMessage: 'Must be a valid Google OAuth Client ID',
        placeholders: ['PLACEHOLDER_GOOGLE_CLIENT_ANDROID'],
    },
    {
        key: 'GOOGLE_OAUTH_CLIENT_ID_WEB',
        required: true,
        level: 'critical',
        description: 'Google OAuth Web Client ID',
        validate: (v) => v.includes('.apps.googleusercontent.com') && !v.includes('PLACEHOLDER'),
        errorMessage: 'Must be a valid Google OAuth Client ID',
        placeholders: ['PLACEHOLDER_GOOGLE_CLIENT_WEB'],
    },
    {
        key: 'GOOGLE_OAUTH_AUDIENCES',
        required: true,
        level: 'critical',
        description: 'Google OAuth audiences',
        validate: (v) => v.includes('.apps.googleusercontent.com') && !v.includes('PLACEHOLDER'),
        errorMessage: 'Must contain all client IDs separated by commas',
        placeholders: ['PLACEHOLDER'],
    },

    // ─── Critical: AI Provider ───
    {
        key: 'GOOGLE_GENERATIVE_AI_API_KEY',
        required: true,
        level: 'critical',
        description: 'Google Gemini API key',
        validate: (v) => v.startsWith('AIzaSy') && !v.includes('PLACEHOLDER'),
        errorMessage: 'Must be a valid Gemini API key (starts with AIzaSy)',
        placeholders: ['PLACEHOLDER_GOOGLE_AI_KEY'],
    },

    // ─── Critical: Push Notifications ───
    {
        key: 'EXPO_ACCESS_TOKEN',
        required: true,
        level: 'critical',
        description: 'Expo access token',
        validate: (v) => v.length > 20 && !v.includes('PLACEHOLDER'),
        errorMessage: 'Must be a valid Expo access token',
        placeholders: ['PLACEHOLDER_EXPO_ACCESS_TOKEN'],
    },

    // ─── Critical: In-App Purchase ───
    {
        key: 'APPLE_SHARED_SECRET',
        required: true,
        level: 'critical',
        description: 'Apple App Store shared secret',
        validate: (v) => v.length > 20 && !v.includes('PLACEHOLDER'),
        errorMessage: 'Must be a valid Apple shared secret',
        placeholders: ['PLACEHOLDER_APPLE_SHARED_SECRET'],
    },
    {
        key: 'GOOGLE_SERVICE_ACCOUNT_KEY',
        required: true,
        level: 'critical',
        description: 'Google Play service account JSON',
        validate: (v) => {
            try {
                const json = JSON.parse(v);
                return json.type === 'service_account' && !v.includes('CHANGE_ME');
            } catch {
                return false;
            }
        },
        errorMessage: 'Must be a valid service account JSON',
        placeholders: ['PLACEHOLDER_GOOGLE_SERVICE_ACCOUNT_JSON', 'CHANGE_ME'],
    },

    // ─── Important: Monitoring ───
    {
        key: 'SENTRY_DSN',
        required: false,
        level: 'important',
        description: 'Sentry error tracking DSN',
        validate: (v) => v.startsWith('https://') && v.includes('sentry.io'),
        errorMessage: 'Must be a valid Sentry DSN',
    },
    {
        key: 'POSTHOG_API_KEY',
        required: false,
        level: 'important',
        description: 'PostHog analytics API key',
        validate: (v) => v.startsWith('phc_'),
        errorMessage: 'Must be a valid PostHog API key (starts with phc_)',
    },

    // ─── Important: Email ───
    {
        key: 'SMTP_HOST',
        required: false,
        level: 'important',
        description: 'SMTP server host',
    },
    {
        key: 'SMTP_PORT',
        required: false,
        level: 'important',
        description: 'SMTP server port',
    },
    {
        key: 'SMTP_USER',
        required: false,
        level: 'important',
        description: 'SMTP username',
    },
    {
        key: 'SMTP_PASS',
        required: false,
        level: 'important',
        description: 'SMTP password',
    },

    // ─── Important: File Storage ───
    {
        key: 'STORAGE_DRIVER',
        required: false,
        level: 'important',
        description: 'File storage driver (filesystem, s3, minio)',
        validate: (v) => ['filesystem', 's3', 'minio'].includes(v),
        errorMessage: 'Must be one of: filesystem, s3, minio',
    },

    // ─── Optional: Backup AI Providers ───
    {
        key: 'OPENAI_API_KEY',
        required: false,
        level: 'optional',
        description: 'OpenAI API key (backup provider)',
        validate: (v) => v.startsWith('sk-') && !v.includes('PLACEHOLDER'),
        errorMessage: 'Must be a valid OpenAI API key',
        placeholders: ['PLACEHOLDER_OPENAI_KEY'],
    },
    {
        key: 'ANTHROPIC_API_KEY',
        required: false,
        level: 'optional',
        description: 'Anthropic API key (backup provider)',
        validate: (v) => v.startsWith('sk-ant-') && !v.includes('PLACEHOLDER'),
        errorMessage: 'Must be a valid Anthropic API key',
        placeholders: ['PLACEHOLDER_ANTHROPIC_KEY'],
    },

    // ─── Network & Security ───
    {
        key: 'NODE_ENV',
        required: true,
        level: 'critical',
        description: 'Node environment',
        validate: (v) => ['development', 'staging', 'production'].includes(v),
        errorMessage: 'Must be one of: development, staging, production',
    },
    {
        key: 'API_BASE_URL',
        required: true,
        level: 'critical',
        description: 'API base URL',
        validate: (v) => v.startsWith('http'),
        errorMessage: 'Must be a valid URL',
    },
    {
        key: 'CORS_ALLOWED_ORIGINS',
        required: true,
        level: 'critical',
        description: 'CORS allowed origins',
        validate: (v) => v.includes('http'),
        errorMessage: 'Must contain at least one URL',
    },
];

interface ValidationResult {
    passed: boolean;
    critical: { passed: number; failed: number; warnings: number };
    important: { passed: number; failed: number; warnings: number };
    optional: { passed: number; failed: number; warnings: number };
    errors: Array<{ key: string; level: string; message: string }>;
    warnings: Array<{ key: string; level: string; message: string }>;
}

function validateEnvironment(): ValidationResult {
    const result: ValidationResult = {
        passed: true,
        critical: { passed: 0, failed: 0, warnings: 0 },
        important: { passed: 0, failed: 0, warnings: 0 },
        optional: { passed: 0, failed: 0, warnings: 0 },
        errors: [],
        warnings: [],
    };

    console.log('🔍 Validating environment variables...\n');

    for (const rule of validationRules) {
        const value = process.env[rule.key];
        const stats = result[rule.level];

        // Check if required variable is missing
        if (rule.required && !value) {
            stats.failed++;
            result.errors.push({
                key: rule.key,
                level: rule.level,
                message: `Missing required variable: ${rule.description}`,
            });
            console.log(`❌ ${rule.key} (${rule.level})`);
            console.log(`   Missing: ${rule.description}\n`);
            continue;
        }

        // Skip validation if optional and not set
        if (!rule.required && !value) {
            stats.warnings++;
            result.warnings.push({
                key: rule.key,
                level: rule.level,
                message: `Optional variable not set: ${rule.description}`,
            });
            console.log(`⚠️  ${rule.key} (${rule.level})`);
            console.log(`   Not set: ${rule.description}\n`);
            continue;
        }

        // Check for placeholder values
        if (value && rule.placeholders) {
            const hasPlaceholder = rule.placeholders.some(p => value.includes(p));
            if (hasPlaceholder) {
                stats.failed++;
                result.errors.push({
                    key: rule.key,
                    level: rule.level,
                    message: `Contains placeholder value: ${rule.description}`,
                });
                console.log(`❌ ${rule.key} (${rule.level})`);
                console.log(`   Contains placeholder: ${rule.description}\n`);
                continue;
            }
        }

        // Run custom validation
        if (value && rule.validate && !rule.validate(value)) {
            stats.failed++;
            result.errors.push({
                key: rule.key,
                level: rule.level,
                message: rule.errorMessage || `Invalid value: ${rule.description}`,
            });
            console.log(`❌ ${rule.key} (${rule.level})`);
            console.log(`   ${rule.errorMessage || 'Invalid value'}\n`);
            continue;
        }

        // Validation passed
        stats.passed++;
        console.log(`✅ ${rule.key} (${rule.level})`);
    }

    // Check if JWT secrets are different
    if (process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET) {
        if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
            result.critical.failed++;
            result.errors.push({
                key: 'JWT_REFRESH_SECRET',
                level: 'critical',
                message: 'JWT_SECRET and JWT_REFRESH_SECRET must be different',
            });
            console.log(`\n❌ JWT_SECRET and JWT_REFRESH_SECRET are the same!`);
        }
    }

    // Determine overall pass/fail
    result.passed = result.critical.failed === 0;

    return result;
}

function printSummary(result: ValidationResult) {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('═'.repeat(60) + '\n');

    console.log(`🔴 Critical: ${result.critical.passed} passed, ${result.critical.failed} failed, ${result.critical.warnings} warnings`);
    console.log(`🟡 Important: ${result.important.passed} passed, ${result.important.failed} failed, ${result.important.warnings} warnings`);
    console.log(`🟢 Optional: ${result.optional.passed} passed, ${result.optional.failed} failed, ${result.optional.warnings} warnings\n`);

    if (result.errors.length > 0) {
        console.log('❌ ERRORS:\n');
        for (const error of result.errors) {
            console.log(`   [${error.level.toUpperCase()}] ${error.key}`);
            console.log(`   ${error.message}\n`);
        }
    }

    if (result.warnings.length > 0) {
        console.log('⚠️  WARNINGS:\n');
        for (const warning of result.warnings) {
            console.log(`   [${warning.level.toUpperCase()}] ${warning.key}`);
            console.log(`   ${warning.message}\n`);
        }
    }

    console.log('═'.repeat(60));

    if (result.passed) {
        console.log('✅ Environment validation PASSED!');
        if (result.warnings.length > 0) {
            console.log(`⚠️  ${result.warnings.length} optional variables not set`);
        }
    } else {
        console.log('❌ Environment validation FAILED!');
        console.log(`   ${result.critical.failed} critical errors must be fixed`);
        if (result.important.failed > 0) {
            console.log(`   ${result.important.failed} important errors should be fixed`);
        }
    }

    console.log('═'.repeat(60) + '\n');

    if (!result.passed) {
        console.log('📖 See PRODUCTION_ENV_GUIDE.md for detailed instructions\n');
    }
}

// Run validation
const result = validateEnvironment();
printSummary(result);

// Exit with appropriate code
process.exit(result.passed ? 0 : 1);
