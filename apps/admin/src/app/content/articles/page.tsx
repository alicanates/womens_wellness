'use client';

import { useTable } from '@refinedev/antd';
import { List, EditButton, DeleteButton } from '@refinedev/antd';
import { Table, Tag, Space, Button, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

const CATEGORY_LABELS: Record<string, string> = {
    menstrual_health: 'Regl Sağlığı',
    pregnancy: 'Hamilelik',
    fertility: 'Doğurganlık',
    nutrition: 'Beslenme',
    exercise: 'Egzersiz',
    mental_health: 'Ruh Sağlığı',
    sleep: 'Uyku',
    hydration: 'Hidrasyon',
    contraception: 'Doğum Kontrolü',
    pms: 'PMS',
    menopause: 'Menopoz',
    sexual_health: 'Cinsel Sağlık',
};

export default function ArticlesList() {
    const router = useRouter();
    const { tableProps } = useTable({
        resource: 'content/articles',
        syncWithLocation: true,
    });

    const columns = [
        {
            title: 'Görsel',
            dataIndex: 'thumbnailUrl',
            key: 'thumbnailUrl',
            width: 80,
            render: (url: string, record: any) => (
                <Image
                    src={url || record.imageUrl || '/placeholder.png'}
                    alt="Makale görseli"
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                />
            ),
        },
        {
            title: 'Başlık (TR)',
            dataIndex: 'titleTr',
            key: 'titleTr',
            ellipsis: true,
            width: 300,
        },
        {
            title: 'Kategori',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => (
                <Tag color="blue">{CATEGORY_LABELS[category] || category}</Tag>
            ),
        },
        {
            title: 'Durum',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Aktif' : 'Pasif'}
                </Tag>
            ),
        },
        {
            title: 'Öncelik',
            dataIndex: 'priority',
            key: 'priority',
            sorter: true,
        },
        {
            title: 'Okuma Süresi',
            dataIndex: 'readTimeMin',
            key: 'readTimeMin',
            render: (time: number) => `${time} dk`,
        },
        {
            title: 'Yayın Tarihi',
            dataIndex: 'publishedAt',
            key: 'publishedAt',
            render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
            sorter: true,
        },
        {
            title: 'İşlemler',
            key: 'actions',
            fixed: 'right' as const,
            width: 120,
            render: (_: any, record: any) => (
                <Space>
                    <EditButton hideText size="small" recordItemId={record.id} />
                    <DeleteButton hideText size="small" recordItemId={record.id} />
                </Space>
            ),
        },
    ];

    return (
        <List
            headerButtons={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => router.push('/content/articles/create')}
                >
                    Makale Oluştur
                </Button>
            }
        >
            <Table
                {...tableProps}
                columns={columns}
                rowKey="id"
                scroll={{ x: 1200 }}
            />
        </List>
    );
}
