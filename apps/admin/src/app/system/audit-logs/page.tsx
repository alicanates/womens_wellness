'use client';

import { useTable } from '@refinedev/antd';
import { List } from '@refinedev/antd';
import { Table, Tag } from 'antd';
import dayjs from 'dayjs';

export default function AuditLogsList() {
    const { tableProps } = useTable({
        resource: 'audit-logs',
        syncWithLocation: true,
        sorters: {
            initial: [
                {
                    field: 'createdAt',
                    order: 'desc',
                },
            ],
        },
    });

    const columns = [
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (action: string) => <Tag>{action}</Tag>,
        },
        {
            title: 'Entity',
            dataIndex: 'entity',
            key: 'entity',
        },
        {
            title: 'Entity ID',
            dataIndex: 'entityId',
            key: 'entityId',
            ellipsis: true,
        },
        {
            title: 'User',
            dataIndex: ['user', 'email'],
            key: 'user',
            render: (email: string) => email || 'System',
        },
        {
            title: 'Metadata',
            dataIndex: 'metadataJson',
            key: 'metadataJson',
            render: (metadata: any) => {
                if (!metadata) return '-';
                return <code style={{ fontSize: 11 }}>{JSON.stringify(metadata).substring(0, 50)}...</code>;
            },
        },
        {
            title: 'Timestamp',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
        },
    ];

    return (
        <List>
            <Table {...tableProps} columns={columns} rowKey="id" />
        </List>
    );
}
