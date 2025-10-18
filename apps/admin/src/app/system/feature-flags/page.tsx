'use client';

import { useTable } from '@refinedev/antd';
import { List, EditButton } from '@refinedev/antd';
import { Table, Tag, Space } from 'antd';
import dayjs from 'dayjs';

export default function FeatureFlagsList() {
    const { tableProps } = useTable({
        resource: 'feature-flags',
        syncWithLocation: true,
    });

    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Value',
            dataIndex: 'valueJson',
            key: 'valueJson',
            render: (value: any) => {
                if (typeof value === 'boolean') {
                    return <Tag color={value ? 'green' : 'red'}>{value ? 'Enabled' : 'Disabled'}</Tag>;
                }
                return <code>{JSON.stringify(value)}</code>;
            },
        },
        {
            title: 'Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <EditButton hideText size="small" recordItemId={record.key} />
                </Space>
            ),
        },
    ];

    return (
        <List>
            <Table {...tableProps} columns={columns} rowKey="key" />
        </List>
    );
}
