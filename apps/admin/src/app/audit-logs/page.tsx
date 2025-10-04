'use client';

import { List, useTable, DateField, ExportButton } from '@refinedev/antd';
import { Table, Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

export default function AuditLogList() {
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

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <ExportButton />
        </>
      )}
    >
      <Table {...tableProps} rowKey="id" size="small">
        <Table.Column
          dataIndex="id"
          title="ID"
          width={80}
          render={(value) => value.substring(0, 8)}
        />
        <Table.Column
          dataIndex="userId"
          title="User"
          width={100}
          render={(value) => value ? value.substring(0, 8) + '...' : 'System'}
        />
        <Table.Column
          dataIndex="action"
          title="Action"
          width={120}
          render={(value) => {
            const colors: Record<string, string> = {
              CREATE: 'green',
              UPDATE: 'blue',
              DELETE: 'red',
              LOGIN: 'purple',
              LOGOUT: 'orange',
            };
            return <Tag color={colors[value] || 'default'}>{value}</Tag>;
          }}
        />
        <Table.Column
          dataIndex="entity"
          title="Entity"
          width={120}
        />
        <Table.Column
          dataIndex="entityId"
          title="Entity ID"
          width={100}
          render={(value) => value ? value.substring(0, 8) : '-'}
        />
        <Table.Column
          dataIndex="metadataJson"
          title="Metadata"
          width={60}
          render={(value) => (
            value ? (
              <Tooltip title={<pre>{JSON.stringify(value, null, 2)}</pre>}>
                <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
              </Tooltip>
            ) : '-'
          )}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Timestamp"
          width={180}
          render={(value) => <DateField value={value} format="YYYY-MM-DD HH:mm:ss" />}
        />
      </Table>
    </List>
  );
}
