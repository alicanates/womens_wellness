/**
 * Test script for subscription scheduler
 * This script demonstrates how to manually trigger scheduled jobs for testing
 * 
 * Usage:
 *   ts-node src/subscription/test-scheduler.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

async function bootstrap() {
    console.log('🚀 Starting subscription scheduler test...\n');

    // Create NestJS application
    const app = await NestFactory.createApplicationContext(AppModule);
    const schedulerService = app.get(SubscriptionSchedulerService);
    const prismaService = app.get(PrismaService);

    try {
        // Display current subscription stats
        console.log('📊 Current Subscription Statistics:');
        const stats = await prismaService.subscription.groupBy({
            by: ['status'],
            _count: true,
        });
        stats.forEach(stat => {
            console.log(`  ${stat.status}: ${stat._count} subscriptions`);
        });
        console.log();

        // Test 1: Quota Reset
        console.log('🔄 Test 1: Quota Reset Job');
        console.log('─'.repeat(50));
        const quotaResetBefore = await prismaService.subscription.findMany({
            where: {
                quotaResetDate: {
                    lte: new Date(),
                },
            },
            select: {
                id: true,
                userId: true,
                aiMessagesUsed: true,
                aiMessagesLimit: true,
                quotaResetDate: true,
            },
            take: 5,
        });
        console.log(`Found ${quotaResetBefore.length} subscriptions needing quota reset`);
        if (quotaResetBefore.length > 0) {
            console.log('Sample subscriptions before reset:');
            quotaResetBefore.forEach(sub => {
                console.log(`  - ${sub.userId}: ${sub.aiMessagesUsed}/${sub.aiMessagesLimit}`);
            });
        }

        await schedulerService.triggerQuotaReset();
        console.log('✅ Quota reset completed\n');

        // Test 2: Expiration Check
        console.log('⏰ Test 2: Expiration Check Job');
        console.log('─'.repeat(50));
        const expiredBefore = await prismaService.subscription.findMany({
            where: {
                OR: [
                    { status: SubscriptionStatus.ACTIVE },
                    { status: SubscriptionStatus.CANCELLED },
                ],
                endDate: {
                    lte: new Date(),
                },
            },
            select: {
                id: true,
                userId: true,
                status: true,
                endDate: true,
            },
            take: 5,
        });
        console.log(`Found ${expiredBefore.length} expired subscriptions`);
        if (expiredBefore.length > 0) {
            console.log('Sample expired subscriptions:');
            expiredBefore.forEach(sub => {
                console.log(`  - ${sub.userId}: ${sub.status} (ended: ${sub.endDate?.toISOString()})`);
            });
        }

        await schedulerService.triggerExpirationCheck();
        console.log('✅ Expiration check completed\n');

        // Test 3: Grace Period Check
        console.log('⚠️  Test 3: Grace Period Check Job');
        console.log('─'.repeat(50));
        const gracePeriodBefore = await prismaService.subscription.findMany({
            where: {
                status: SubscriptionStatus.GRACE_PERIOD,
                gracePeriodEndDate: {
                    lte: new Date(),
                },
            },
            select: {
                id: true,
                userId: true,
                gracePeriodEndDate: true,
            },
            take: 5,
        });
        console.log(`Found ${gracePeriodBefore.length} grace periods that ended`);
        if (gracePeriodBefore.length > 0) {
            console.log('Sample grace periods:');
            gracePeriodBefore.forEach(sub => {
                console.log(`  - ${sub.userId}: ended ${sub.gracePeriodEndDate?.toISOString()}`);
            });
        }

        await schedulerService.triggerGracePeriodCheck();
        console.log('✅ Grace period check completed\n');

        // Display updated stats
        console.log('📊 Updated Subscription Statistics:');
        const updatedStats = await prismaService.subscription.groupBy({
            by: ['status'],
            _count: true,
        });
        updatedStats.forEach(stat => {
            console.log(`  ${stat.status}: ${stat._count} subscriptions`);
        });
        console.log();

        console.log('✨ All scheduler tests completed successfully!');
    } catch (error) {
        console.error('❌ Error during scheduler test:', error);
        throw error;
    } finally {
        await app.close();
    }
}

bootstrap()
    .then(() => {
        console.log('\n👋 Test completed, exiting...');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });
