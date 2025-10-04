'use client';

import { List, useTable } from '@refinedev/antd';
import { Table, Progress, Tag } from 'antd';
import dayjs from 'dayjs';

export default function QuotaList() {
  const { tableProps } = useTable({
    resource: 'quotas',
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="userId">
        <Table.Column
          dataIndex="userId"
          title="User ID"
          width={100}
          render={(value) => value.substring(0, 8) + '...'}
        />
        <Table.Column
          dataIndex="user"
          title="Email"
          render={(user: any) => user?.email || 'N/A'}
        />
        <Table.Column
          dataIndex="monthKey"
          title="Month"
          render={(value) => {
            const [year, month] = value.split('-');
            return dayjs(`${year}-${month}-01`).format('MMMM YYYY');
          }}
        />
        <Table.Column
          dataIndex="aiRequests"
          title="AI Requests"
          render={(value) => <Tag color="blue">{value}</Tag>}
        />
        <Table.Column
          dataIndex="limit"
          title="Limit"
          render={(value) => <Tag color="orange">{value}</Tag>}
        />
        <Table.Column
          title="Usage %"
          render={(_, record: any) => {
            const percentage = Math.round((record.aiRequests / record.limit) * 100);
            const color = percentage >= 100 ? 'red' : percentage >= 80 ? 'orange' : 'green';
            return (
              <Progress
                percent={Math.min(percentage, 100)}
                status={percentage >= 100 ? 'exception' : 'normal'}
                strokeColor={color}
              />
            );
          }}
        />
        <Table.Column
          dataIndex="resetsAt"
          title="Resets At"
          render={(value) => dayjs(value).format('MMM DD, YYYY')}
        />
      </Table>
    </List>
  );
}
