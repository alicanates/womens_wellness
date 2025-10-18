'use client';

import { useShow, useUpdate } from '@refinedev/core';
import { Show } from '@refinedev/antd';
import { Typography, Descriptions, Tag, Card, Button, Space, message } from 'antd';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

export default function ReportShow() {
    const { queryResult } = useShow({
        resource: 'qna/moderation/reports',
    });

    const { mutate: updateReport } = useUpdate();

    const { data, isLoading } = queryResult;
    const record = data?.data;

    const handleReview = (action: string) => {
        updateReport(
            {
                resource: 'qna/moderation/reports',
                id: record?.id,
                values: { action },
            },
            {
                onSuccess: () => {
                    message.success(`Rapor ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`);
                    queryResult.refetch();
                },
            }
        );
    };

    const contentTypeLabels: Record<string, string> = {
        QUESTION: 'Soru',
        ANSWER: 'Cevap',
        COMMENT: 'Yorum',
    };

    const statusLabels: Record<string, string> = {
        PENDING: 'Beklemede',
        REVIEWED: 'İncelendi',
        RESOLVED: 'Çözüldü',
        DISMISSED: 'Reddedildi',
    };

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>Rapor Detayları</Title>
            <Descriptions bordered column={2}>
                <Descriptions.Item label="İçerik Türü">
                    <Tag>{contentTypeLabels[record?.contentType] || record?.contentType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                    <Tag color={record?.status === 'PENDING' ? 'orange' : 'green'}>
                        {statusLabels[record?.status] || record?.status}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Sebep">{record?.reason}</Descriptions.Item>
                <Descriptions.Item label="Raporlayan">{record?.reporter?.email}</Descriptions.Item>
                <Descriptions.Item label="Rapor Tarihi">
                    {dayjs(record?.createdAt).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="İnceleyen">
                    {record?.reviewer?.email || 'Henüz incelenmedi'}
                </Descriptions.Item>
            </Descriptions>

            {record?.description && (
                <Card title="Açıklama" style={{ marginTop: 16 }}>
                    <Paragraph>{record.description}</Paragraph>
                </Card>
            )}

            <Card title="İşlemler" style={{ marginTop: 16 }}>
                <Space>
                    <Button type="primary" onClick={() => handleReview('approve')}>
                        Onayla & İçeriği Kaldır
                    </Button>
                    <Button onClick={() => handleReview('dismiss')}>
                        Raporu Reddet
                    </Button>
                </Space>
            </Card>
        </Show>
    );
}
