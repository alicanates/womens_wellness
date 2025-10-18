'use client';

import { useTable } from '@refinedev/antd';
import { List } from '@refinedev/antd';
import { Table, Tag, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

export default function PregnancyList() {
    const router = useRouter();
    const { tableProps } = useTable({
        resource: 'health/pregnancy',
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
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'default'}>
                    {isActive ? 'Aktif' : 'Pasif'}
                </Tag>
            ),
        },
        {
            title: 'Hafta',
            dataIndex: 'weekCache',
            key: 'weekCache',
            render: (week: number) => week ? `${week}. Hafta` : 'Yok',
        },
        {
            title: 'Trimester',
            dataIndex: 'trimester',
            key: 'trimester',
            render: (trimester: number) => trimester ? `${trimester}. Trimester` : 'Yok',
        },
        {
            title: 'Tahmini Doğum',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : 'Yok',
        },
        {
            title: 'Anonim Mod',
            dataIndex: 'anonymousMode',
            key: 'anonymousMode',
            render: (anonymous: boolean) => anonymous ? 'Evet' : 'Hayır',
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => router.push(`/health/pregnancy/show/${record.id}`)}
                >
                    Görüntüle
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
