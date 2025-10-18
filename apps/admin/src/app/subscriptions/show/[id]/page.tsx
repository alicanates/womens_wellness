'use client';

import { useShow } from '@refinedev/core';
import { Show } from '@refinedev/antd';
import { Typography, Descriptions, Tag, Table } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function SubscriptionShow() {
    const { queryResult } = useShow({
        resource: 'subscriptions',
    });

    const { data, isLoading } = queryResult;
    const record = data?.data;

    const statusLabels: Record<string, string> = {
        FREE: 'Ücretsiz',
        TRIAL: 'Deneme',
        ACTIVE: 'Aktif',
        EXPIRED: 'Süresi Doldu',
        CANCELLED: 'İptal Edildi',
        GRACE_PERIOD: 'Ek Süre',
    };

    const tierLabels: Record<string, string> = {
        MONTHLY: 'Aylık',
        YEARLY: 'Yıllık',
    };

    const providerLabels: Record<string, string> = {
        APPLE: 'Apple',
        GOOGLE: 'Google',
    };

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>Abonelik Detayları</Title>
            <Descriptions bordered column={2}>
                <Descriptions.Item label="Kullanıcı E-postası">{record?.user?.email}</Descriptions.Item>
                <Descriptions.Item label="Durum">
                    <Tag color={record?.status === 'ACTIVE' ? 'green' : 'default'}>
                        {statusLabels[record?.status] || record?.status}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Seviye">{tierLabels[record?.tier] || 'Yok'}</Descriptions.Item>
                <Descriptions.Item label="Sağlayıcı">{providerLabels[record?.provider] || 'Yok'}</Descriptions.Item>
                <Descriptions.Item label="Başlangıç Tarihi">
                    {record?.startDate ? dayjs(record.startDate).format('YYYY-MM-DD HH:mm') : 'Yok'}
                </Descriptions.Item>
                <Descriptions.Item label="Bitiş Tarihi">
                    {record?.endDate ? dayjs(record.endDate).format('YYYY-MM-DD HH:mm') : 'Yok'}
                </Descriptions.Item>
                <Descriptions.Item label="Kullanılan AI Mesajı">{record?.aiMessagesUsed || 0}</Descriptions.Item>
                <Descriptions.Item label="AI Mesaj Limiti">{record?.aiMessagesLimit || 0}</Descriptions.Item>
                <Descriptions.Item label="Deneme Bitiş Tarihi">
                    {record?.trialEndDate ? dayjs(record.trialEndDate).format('YYYY-MM-DD') : 'Yok'}
                </Descriptions.Item>
                <Descriptions.Item label="Deneme Kullanıldı">{record?.hasHadTrial ? 'Evet' : 'Hayır'}</Descriptions.Item>
            </Descriptions>

            {record?.transactions && record.transactions.length > 0 && (
                <>
                    <Title level={5} style={{ marginTop: 24 }}>İşlemler</Title>
                    <Table
                        dataSource={record.transactions}
                        rowKey="id"
                        columns={[
                            {
                                title: 'İşlem ID',
                                dataIndex: 'transactionId',
                                key: 'transactionId',
                            },
                            {
                                title: 'Tür',
                                dataIndex: 'type',
                                key: 'type',
                            },
                            {
                                title: 'Durum',
                                dataIndex: 'status',
                                key: 'status',
                                render: (status: string) => <Tag>{status}</Tag>,
                            },
                            {
                                title: 'Tutar',
                                key: 'amount',
                                render: (_: any, record: any) => `${record.amount} ${record.currency}`,
                            },
                            {
                                title: 'Tarih',
                                dataIndex: 'createdAt',
                                key: 'createdAt',
                                render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
                            },
                        ]}
                    />
                </>
            )}
        </Show>
    );
}
