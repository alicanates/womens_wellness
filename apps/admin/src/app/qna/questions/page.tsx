'use client';

import { useTable } from '@refinedev/antd';
import { List } from '@refinedev/antd';
import { Table, Tag, Space, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

export default function QuestionsList() {
    const router = useRouter();
    const { tableProps } = useTable({
        resource: 'qna/questions',
        syncWithLocation: true,
    });

    const columns = [
        {
            title: 'Başlık',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: 'Kategori',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => <Tag>{category}</Tag>,
        },
        {
            title: 'Durum',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    OPEN: 'blue',
                    ANSWERED: 'green',
                    CLOSED: 'default',
                };
                const labels: Record<string, string> = {
                    OPEN: 'Açık',
                    ANSWERED: 'Cevaplandı',
                    CLOSED: 'Kapalı',
                };
                return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
            },
        },
        {
            title: 'Anonim',
            dataIndex: 'isAnonymous',
            key: 'isAnonymous',
            render: (isAnonymous: boolean) => isAnonymous ? 'Evet' : 'Hayır',
        },
        {
            title: 'Görüntülenme',
            dataIndex: 'viewCount',
            key: 'viewCount',
        },
        {
            title: 'Cevaplar',
            dataIndex: '_count',
            key: 'answers',
            render: (count: any) => count?.answers || 0,
        },
        {
            title: 'Oluşturulma',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => router.push(`/qna/questions/show/${record.id}`)}
                    >
                        Görüntüle
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <List>
            <Table {...tableProps} columns={columns} rowKey="id" />
        </List>
    );
}
