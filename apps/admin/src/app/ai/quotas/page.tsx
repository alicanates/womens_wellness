'use client';

import { useTable } from '@refinedev/antd';
import { List } from '@refinedev/antd';
import { Table, Progress, Tag } from 'antd';

export default function QuotasList() {
    const { tableProps } = useTable({
        resource: 'ai/quotas',
        syncWithLocation: true,
    });

    const columns = [
        {
            title: 'Kullanıcı E-postası',
            dataIndex: ['user', 'email'],
            key: 'email',
        },
        {
            title: 'Ay',
            dataIndex: 'monthKey',
            key: 'monthKey',
        },
        {
            title: 'AI İstekleri',
            key: 'requests',
            render: (_: any, record: any) => `${record.aiRequests} / ${record.limit}`,
        },
        {
            title: 'Kullanım',
            key: 'usage',
            render: (_: any, record: any) => {
                const percent = (record.aiRequests / record.limit) * 100;
                return <Progress percent={Math.round(percent)} size="small" />;
            },
        },
        {
            title: 'Durum',
            key: 'status',
            render: (_: any, record: any) => {
                const percent = (record.aiRequests / record.limit) * 100;
                if (percent >= 100) return <Tag color="red">Aşıldı</Tag>;
                if (percent >= 80) return <Tag color="orange">Yüksek</Tag>;
                return <Tag color="green">Normal</Tag>;
            },
        },
    ];

    return (
        <List>
            <Table {...tableProps} columns={columns} rowKey="id" />
        </List>
    );
}
