'use client';

import { useList } from '@refinedev/core';
import { List, useTable } from '@refinedev/antd';
import { Table, Tag, Space } from 'antd';
import dayjs from 'dayjs';

export default function SubscriptionsList() {
    const { tableProps } = useTable({
        resource: 'subscriptions',
        syncWithLocation: true,
    });

    const columns = [
        {
            title: 'Kullanıcı E-postası',
            dataIndex: ['user', 'email'],
            key: 'email',
        },
        {
            title: 'Durum',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    FREE: 'default',
                    TRIAL: 'blue',
                    ACTIVE: 'green',
                    EXPIRED: 'red',
                    CANCELLED: 'orange',
                    GRACE_PERIOD: 'yellow',
                };
                const labels: Record<string, string> = {
                    FREE: 'Ücretsiz',
                    TRIAL: 'Deneme',
                    ACTIVE: 'Aktif',
                    EXPIRED: 'Süresi Doldu',
                    CANCELLED: 'İptal Edildi',
                    GRACE_PERIOD: 'Ek Süre',
                };
                return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
            },
        },
        {
            title: 'Seviye',
            dataIndex: 'tier',
            key: 'tier',
            render: (tier: string) => {
                if (!tier) return 'Yok';
                return tier === 'MONTHLY' ? 'Aylık' : tier === 'YEARLY' ? 'Yıllık' : tier;
            },
        },
        {
            title: 'Sağlayıcı',
            dataIndex: 'provider',
            key: 'provider',
            render: (provider: string) => {
                if (!provider) return 'Yok';
                return provider === 'APPLE' ? 'Apple' : provider === 'GOOGLE' ? 'Google' : provider;
            },
        },
        {
            title: 'Başlangıç',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : 'Yok',
        },
        {
            title: 'Bitiş',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : 'Yok',
        },
        {
            title: 'AI Mesajları',
            key: 'aiMessages',
            render: (_: any, record: any) => `${record.aiMessagesUsed || 0} / ${record.aiMessagesLimit || 0}`,
        },
    ];

    return (
        <List>
            <Table {...tableProps} columns={columns} rowKey="id" />
        </List>
    );
}
