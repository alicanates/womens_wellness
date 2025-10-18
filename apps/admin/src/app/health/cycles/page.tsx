'use client';

import { useTable } from '@refinedev/antd';
import { List } from '@refinedev/antd';
import { Table, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

export default function CyclesList() {
    const router = useRouter();
    const { tableProps } = useTable({
        resource: 'health/cycles',
        syncWithLocation: true,
    });

    const columns = [
        {
            title: 'Kullanıcı E-postası',
            dataIndex: ['user', 'email'],
            key: 'email',
        },
        {
            title: 'Başlangıç',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
        },
        {
            title: 'Bitiş',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : 'Devam Ediyor',
        },
        {
            title: 'Süre',
            key: 'duration',
            render: (_: any, record: any) => {
                if (!record.endDate) return 'Devam Ediyor';
                const days = dayjs(record.endDate).diff(dayjs(record.startDate), 'day');
                return `${days} gün`;
            },
        },
        {
            title: 'Not Var',
            dataIndex: 'notes',
            key: 'notes',
            render: (notes: string) => notes ? 'Evet' : 'Hayır',
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => router.push(`/health/cycles/show/${record.id}`)}
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
