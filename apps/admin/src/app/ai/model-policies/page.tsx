'use client';

import { useTable } from '@refinedev/antd';
import { List, EditButton, DeleteButton } from '@refinedev/antd';
import { Table, Tag, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

export default function ModelPoliciesList() {
    const router = useRouter();
    const { tableProps } = useTable({
        resource: 'model-policies',
        syncWithLocation: true,
    });

    const columns = [
        {
            title: 'Plan',
            dataIndex: 'plan',
            key: 'plan',
            render: (plan: string) => (
                <Tag color={plan === 'premium' ? 'gold' : 'default'}>
                    {plan.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Provider',
            dataIndex: 'provider',
            key: 'provider',
            render: (provider: string) => <Tag>{provider}</Tag>,
        },
        {
            title: 'Model Name',
            dataIndex: 'modelName',
            key: 'modelName',
        },
        {
            title: 'Temperature',
            dataIndex: 'temperature',
            key: 'temperature',
        },
        {
            title: 'Max Tokens',
            dataIndex: 'maxTokens',
            key: 'maxTokens',
        },
        {
            title: 'Actions',
            key: 'actions',
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
                    onClick={() => router.push('/ai/model-policies/create')}
                >
                    Create Policy
                </Button>
            }
        >
            <Table {...tableProps} columns={columns} rowKey="id" />
        </List>
    );
}
