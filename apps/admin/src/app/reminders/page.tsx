'use client';

import { List, useTable, DateField } from '@refinedev/antd';
import { Table, Tag, Switch } from 'antd';

export default function ReminderList() {
  const { tableProps } = useTable({
    resource: 'reminders',
    syncWithLocation: true,
  });

  return (
    <List>
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
          render={(value) => value.substring(0, 8) + '...'}
        />
        <Table.Column
          dataIndex="type"
          title="Type"
          width={100}
          render={(value) => (
            <Tag color="blue">{value}</Tag>
          )}
        />
        <Table.Column
          dataIndex="payloadJson"
          title="Title"
          render={(payload: any) => payload?.title || 'N/A'}
        />
        <Table.Column
          dataIndex="payloadJson"
          title="Time"
          width={80}
          render={(payload: any) => payload?.time || 'N/A'}
        />
        <Table.Column
          dataIndex="active"
          title="Active"
          width={80}
          render={(value) => (
            <Switch checked={value} disabled />
          )}
        />
        <Table.Column
          dataIndex="nextRunAt"
          title="Next Run"
          width={180}
          render={(value) => <DateField value={value} format="YYYY-MM-DD HH:mm" />}
        />
      </Table>
    </List>
  );
}
