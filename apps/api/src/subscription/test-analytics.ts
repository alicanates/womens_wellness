/**
 * Test script for Subscription Analytics
 * 
 * Usage:
 * npx ts-node -r tsconfig-paths/register apps/api/src/subscription/test-analytics.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAnalytics() {
    console.log('🔍 Testing Subscription Analytics...\n');

    try {
        // Test 1: Get MRR
        console.log('📊 Test 1: Calculate MRR');
        const activeSubscriptions = await prisma.subscription.findMany({
            where: {
                status: {
                    in: ['ACTIVE', 'TRIAL', 'GRACE_PERIOD'],
                },
            },
            select: {
                tier: true,
                status: true,
            },
        });

        let monthlyMRR = 0;
        let yearlyMRR = 0;

        for (const sub of activeSubscriptions) {
            if (sub.tier === 'MONTHLY') {
                monthlyMRR += 99;
            } else if (sub.tier === 'YEARLY') {
                yearlyMRR += 999 / 12;
            }
        }

        const totalMRR = monthlyMRR + yearlyMRR;

        console.log('✅ MRR Results:');
        console.log(`   Total MRR: ₺${totalMRR.toFixed(2)}`);
        console.log(`   Monthly MRR: ₺${monthlyMRR.toFixed(2)}`);
        console.log(`   Yearly MRR: ₺${yearlyMRR.toFixed(2)}`);
        console.log(`   Active Subscriptions: ${activeSubscriptions.length}\n`);

        // Test 2: Get ARPU
        console.log('📊 Test 2: Calculate ARPU');
        const totalUsers = await prisma.user.count();
        const overallARPU = totalUsers > 0 ? totalMRR / totalUsers : 0;
        const payingARPU = activeSubscriptions.length > 0 ? totalMRR / activeSubscriptions.length : 0;

        console.log('✅ ARPU Results:');
        console.log(`   Overall ARPU: ₺${overallARPU.toFixed(2)}`);
        console.log(`   Paying ARPU: ₺${payingARPU.toFixed(2)}`);
        console.log(`   Total Users: ${totalUsers}`);
        console.log(`   Paying Users: ${activeSubscriptions.length}\n`);

        // Test 3: Get Subscription Distribution
        console.log('📊 Test 3: Subscription Distribution');
        const allSubscriptions = await prisma.subscription.findMany({
            select: {
                tier: true,
                status: true,
                provider: true,
            },
        });

        const byTier: Record<string, number> = {};
        const byStatus: Record<string, number> = {};
        const byProvider: Record<string, number> = {};

        for (const sub of allSubscriptions) {
            const tier = sub.tier || 'FREE';
            byTier[tier] = (byTier[tier] || 0) + 1;
            byStatus[sub.status] = (byStatus[sub.status] || 0) + 1;
            if (sub.provider) {
                byProvider[sub.provider] = (byProvider[sub.provider] || 0) + 1;
            }
        }

        console.log('✅ Distribution Results:');
        console.log('   By Tier:', byTier);
        console.log('   By Status:', byStatus);
        console.log('   By Provider:', byProvider);
        console.log();

        // Test 4: Get Recent Events
        console.log('📊 Test 4: Recent Subscription Events');
        const recentEvents = await prisma.auditLog.findMany({
            where: {
                entity: 'subscription',
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });

        console.log(`✅ Found ${recentEvents.length} recent events:`);
        for (const event of recentEvents) {
            console.log(`   - ${event.action} at ${event.createdAt.toISOString()}`);
        }
        console.log();

        // Test 5: Get Revenue Metrics (Last 30 days)
        console.log('📊 Test 5: Revenue Metrics (Last 30 days)');
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        const transactions = await prisma.subscriptionTransaction.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: {
                    in: ['COMPLETED', 'REFUNDED'],
                },
            },
        });

        let totalRevenue = 0;
        let newRevenue = 0;
        let renewalRevenue = 0;
        let refundedRevenue = 0;

        for (const transaction of transactions) {
            if (transaction.status === 'REFUNDED') {
                refundedRevenue += transaction.amount;
            } else {
                totalRevenue += transaction.amount;
                if (transaction.type === 'INITIAL_PURCHASE') {
                    newRevenue += transaction.amount;
                } else if (transaction.type === 'RENEWAL') {
                    renewalRevenue += transaction.amount;
                }
            }
        }

        console.log('✅ Revenue Results:');
        console.log(`   Total Revenue: ₺${totalRevenue.toFixed(2)}`);
        console.log(`   New Revenue: ₺${newRevenue.toFixed(2)}`);
        console.log(`   Renewal Revenue: ₺${renewalRevenue.toFixed(2)}`);
        console.log(`   Refunded: ₺${refundedRevenue.toFixed(2)}`);
        console.log(`   Transactions: ${transactions.length}\n`);

        // Test 6: Conversion Metrics
        console.log('📊 Test 6: Conversion Metrics (Last 30 days)');
        const newUsers = await prisma.user.count({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        const conversionEvents = await prisma.auditLog.findMany({
            where: {
                action: 'subscription_conversion',
                entity: 'subscription',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        const conversions = conversionEvents.length;
        const conversionRate = newUsers > 0 ? (conversions / newUsers) * 100 : 0;

        console.log('✅ Conversion Results:');
        console.log(`   New Users: ${newUsers}`);
        console.log(`   Conversions: ${conversions}`);
        console.log(`   Conversion Rate: ${conversionRate.toFixed(2)}%\n`);

        // Test 7: Churn Metrics
        console.log('📊 Test 7: Churn Metrics (Last 30 days)');
        const churnEvents = await prisma.auditLog.findMany({
            where: {
                action: 'subscription_churn',
                entity: 'subscription',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        const churnReasons: Record<string, number> = {};
        for (const event of churnEvents) {
            const reason = (event.metadataJson as any)?.reason || 'unknown';
            churnReasons[reason] = (churnReasons[reason] || 0) + 1;
        }

        console.log('✅ Churn Results:');
        console.log(`   Churned Users: ${churnEvents.length}`);
        console.log(`   Churn Reasons:`, churnReasons);
        console.log();

        console.log('✅ All analytics tests completed successfully!');

    } catch (error) {
        console.error('❌ Error testing analytics:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run tests
testAnalytics()
    .then(() => {
        console.log('\n✅ Analytics test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Analytics test failed:', error);
        process.exit(1);
    });
