'use client';

import { List, useTable, EditButton, ShowButton, DateField } from '@refinedev/antd';
import { Table, Space, Tag } from 'antd';
import dayjs from 'dayjs';

export default function UserList() {
  const { tableProps } = useTable({
    resource: 'users',
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" width={80} />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column
          dataIndex={['profile', 'username']}
          title="Username"
          render={(value) => value || '-'}
        />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value) => (
            <Tag color={value === 'ACTIVE' ? 'green' : 'red'}>
              {value}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Created"
          render={(value) => <DateField value={value} format="LLL" />}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
