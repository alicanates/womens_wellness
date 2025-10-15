/**
 * Quick validation script for SSE buffer settings
 * Run: node apps/mobile/validate-sse-buffer.js
 */

const fs = require('fs');
const path = require('path');

function extractBufferConfig(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');

        const bufferSizeMatch = content.match(/STREAM_BUFFER_SIZE\s*=\s*(\d+)/);
        const flushIntervalMatch = content.match(/STREAM_FLUSH_INTERVAL\s*=\s*(\d+)/);
        const maxWaitMatch = content.match(/MAX_BUFFER_WAIT\s*=\s*(\d+)/);

        if (!bufferSizeMatch || !flushIntervalMatch || !maxWaitMatch) {
            return null;
        }

        return {
            bufferSize: parseInt(bufferSizeMatch[1]),
            flushInterval: parseInt(flushIntervalMatch[1]),
            maxBufferWait: parseInt(maxWaitMatch[1]),
        };
    } catch (error) {
        console.error('Error reading file:', error);
        return null;
    }
}

function validateConfig(config) {
    const issues = [];

    // Validate buffer size
    if (config.bufferSize < 128) {
        issues.push(`⚠️  Buffer size (${config.bufferSize}) is too small. Recommended: 256-1024`);
    } else if (config.bufferSize > 2048) {
        issues.push(`⚠️  Buffer size (${config.bufferSize}) is too large. Recommended: 256-1024`);
    } else if (config.bufferSize === 512) {
        console.log(`✅ Buffer size (${config.bufferSize}) is optimal`);
    } else {
        console.log(`✓  Buffer size (${config.bufferSize}) is acceptable`);
    }

    // Validate flush interval
    if (config.flushInterval < 16) {
        issues.push(`⚠️  Flush interval (${config.flushInterval}ms) is too low. Recommended: 25-100ms`);
    } else if (config.flushInterval > 200) {
        issues.push(`⚠️  Flush interval (${config.flushInterval}ms) is too high. Recommended: 25-100ms`);
    } else if (config.flushInterval === 50) {
        console.log(`✅ Flush interval (${config.flushInterval}ms) is optimal`);
    } else {
        console.log(`✓  Flush interval (${config.flushInterval}ms) is acceptable`);
    }

    // Validate max buffer wait
    if (config.maxBufferWait < 50) {
        issues.push(`⚠️  Max buffer wait (${config.maxBufferWait}ms) is too low. Recommended: 100-500ms`);
    } else if (config.maxBufferWait > 1000) {
        issues.push(`⚠️  Max buffer wait (${config.maxBufferWait}ms) is too high. Recommended: 100-500ms`);
    } else if (config.maxBufferWait === 200) {
        console.log(`✅ Max buffer wait (${config.maxBufferWait}ms) is optimal`);
    } else {
        console.log(`✓  Max buffer wait (${config.maxBufferWait}ms) is acceptable`);
    }

    // Validate relationships
    if (config.flushInterval >= config.maxBufferWait) {
        issues.push(`⚠️  Flush interval (${config.flushInterval}ms) should be less than max buffer wait (${config.maxBufferWait}ms)`);
    }

    return {
        valid: issues.length === 0,
        issues,
    };
}

function calculatePerformanceMetrics(config) {
    console.log('\n📊 Performance Metrics:');

    // Estimated flushes per second
    const flushesPerSec = 1000 / config.flushInterval;
    console.log(`  - Max flushes per second: ${flushesPerSec.toFixed(1)}`);

    // Estimated characters per second (assuming buffer fills)
    const charsPerSec = (config.bufferSize * 1000) / config.maxBufferWait;
    console.log(`  - Max throughput: ${charsPerSec.toFixed(0)} chars/sec`);

    // Latency estimate
    const avgLatency = (config.flushInterval + config.maxBufferWait) / 2;
    console.log(`  - Average latency: ${avgLatency.toFixed(0)}ms`);

    // UI update frequency
    const uiUpdatesPerSec = Math.min(flushesPerSec, 60); // Capped at 60 FPS
    console.log(`  - UI updates per second: ${uiUpdatesPerSec.toFixed(1)}`);
}

function main() {
    console.log('🔍 SSE Buffer Configuration Validator\n');

    const sseFilePath = path.join(__dirname, 'src/lib/sse.ts');
    console.log(`Reading configuration from: ${sseFilePath}\n`);

    const config = extractBufferConfig(sseFilePath);

    if (!config) {
        console.error('❌ Failed to extract buffer configuration');
        process.exit(1);
    }

    console.log('Current Configuration:');
    console.log(`  - Buffer Size: ${config.bufferSize} characters`);
    console.log(`  - Flush Interval: ${config.flushInterval}ms`);
    console.log(`  - Max Buffer Wait: ${config.maxBufferWait}ms\n`);

    const validation = validateConfig(config);

    if (validation.issues.length > 0) {
        console.log('\n⚠️  Issues Found:');
        validation.issues.forEach(issue => console.log(`  ${issue}`));
    }

    calculatePerformanceMetrics(config);

    if (validation.valid) {
        console.log('\n✅ All buffer settings are valid and optimized!\n');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some settings could be improved. See issues above.\n');
        process.exit(0);
    }
}

main();
