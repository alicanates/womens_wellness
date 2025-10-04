'use client';

import { List, useTable, EditButton, CreateButton } from '@refinedev/antd';
import { Table, Space, Tag } from 'antd';

export default function ModelPolicyList() {
  const { tableProps } = useTable({
    resource: 'model-policies',
    syncWithLocation: true,
  });

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <CreateButton />
        </>
      )}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" width={80} />
        <Table.Column
          dataIndex="plan"
          title="Plan"
          render={(value) => (
            <Tag color={value === 'premium' ? 'gold' : 'blue'}>
              {value.toUpperCase()}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="provider"
          title="Provider"
          render={(value) => (
            <Tag color="purple">{value.toUpperCase()}</Tag>
          )}
        />
        <Table.Column dataIndex="modelName" title="Model" />
        <Table.Column dataIndex="temperature" title="Temperature" />
        <Table.Column dataIndex="maxTokens" title="Max Tokens" />
        <Table.Column
          dataIndex="toolsEnabledJson"
          title="Tools"
          render={(value) => {
            const tools = value || [];
            return tools.length > 0 ? (
              <Tag>{tools.length} tools</Tag>
            ) : (
              <Tag>No tools</Tag>
            );
          }}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
