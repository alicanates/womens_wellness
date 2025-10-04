'use client';

import { List, useTable, EditButton } from '@refinedev/antd';
import { Table, Space, Switch } from 'antd';
import { useState } from 'react';
import { useUpdate } from '@refinedev/core';

export default function FeatureFlagList() {
  const { tableProps } = useTable({
    resource: 'feature-flags',
    syncWithLocation: true,
  });

  const { mutate } = useUpdate();

  const handleToggle = (record: any) => {
    const currentValue = record.valueJson;
    const newValue = typeof currentValue === 'boolean' ? !currentValue : true;

    mutate({
      resource: 'feature-flags',
      id: record.key,
      values: {
        valueJson: newValue,
      },
    });
  };

  return (
    <List>
      <Table {...tableProps} rowKey="key">
        <Table.Column dataIndex="key" title="Key" />
        <Table.Column
          dataIndex="valueJson"
          title="Value"
          render={(value) => {
            if (typeof value === 'boolean') {
              return value ? 'Enabled' : 'Disabled';
            }
            return JSON.stringify(value);
          }}
        />
        <Table.Column
          title="Toggle"
          dataIndex="toggle"
          render={(_, record: any) => {
            if (typeof record.valueJson === 'boolean') {
              return (
                <Switch
                  checked={record.valueJson}
                  onChange={() => handleToggle(record)}
                />
              );
            }
            return '-';
          }}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.key} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
