'use client';

import { useTable } from '@refinedev/antd';
import { List, EditButton, DeleteButton, CreateButton } from '@refinedev/antd';
import { Table, Tag, Space, Tooltip } from 'antd';
import { useRouter } from 'next/navigation';

const providerInfo = {
    google: { name: 'Google Gemini', icon: '🔷', color: '#4285F4' },
    openai: { name: 'OpenAI', icon: '🤖', color: '#10A37F' },
    anthropic: { name: 'Anthropic', icon: '🧠', color: '#D97757' },
    deepseek: { name: 'DeepSeek', icon: '⚡', color: '#7C3AED' },
};

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
            render: (provider: keyof typeof providerInfo) => {
                const info = providerInfo[provider];
                return (
                    <Space>
                        <span style={{ fontSize: 16 }}>{info?.icon || '❓'}</span>
                        <Tag color={info?.color || 'default'}>
                            {info?.name || provider}
                        </Tag>
                    </Space>
                );
            },
        },
        {
            title: 'Model Name',
            dataIndex: 'modelName',
            key: 'modelName',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
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
            title="Model Policies"
            headerButtons={
                <CreateButton onClick={() => router.push('/ai/model-policies/create')} />
            }
        >
            <Table {...tableProps} columns={columns} rowKey="id" />
        </List>
    );
}
