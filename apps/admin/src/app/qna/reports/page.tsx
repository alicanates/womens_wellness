'use client';

import { useTable } from '@refinedev/antd';
import { List } from '@refinedev/antd';
import { Table, Tag, Button, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

export default function ReportsList() {
    const router = useRouter();
    const { tableProps } = useTable({
        resource: 'qna/moderation/reports',
        syncWithLocation: true,
    });

    const columns = [
        {
            title: 'İçerik Türü',
            dataIndex: 'contentType',
            key: 'contentType',
            render: (type: string) => {
                const labels: Record<string, string> = {
                    QUESTION: 'Soru',
                    ANSWER: 'Cevap',
                    COMMENT: 'Yorum',
                };
                return <Tag>{labels[type] || type}</Tag>;
            },
        },
        {
            title: 'Sebep',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Durum',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    PENDING: 'orange',
                    REVIEWED: 'blue',
                    RESOLVED: 'green',
                    DISMISSED: 'default',
                };
                const labels: Record<string, string> = {
                    PENDING: 'Beklemede',
                    REVIEWED: 'İncelendi',
                    RESOLVED: 'Çözüldü',
                    DISMISSED: 'Reddedildi',
                };
                return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
            },
        },
        {
            title: 'Raporlayan',
            dataIndex: ['reporter', 'email'],
            key: 'reporter',
        },
        {
            title: 'Rapor Tarihi',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => router.push(`/qna/reports/show/${record.id}`)}
                >
                    İncele
                </Button>
            ),
        },
    ];

    return (
        <List>
            <Table {...tableProps} columns={columns} rowKey="id" />
        </List>
    );
}
