'use client';

import { List, useTable, EditButton } from '@refinedev/antd';
import { Table, Space, Switch } from 'antd';
import { useState } from 'react';
import { useInvalidate } from '@refinedev/core';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function FeatureFlagList() {
  const { tableProps } = useTable({
    resource: 'feature-flags',
    syncWithLocation: true,
  });

  const invalidate = useInvalidate();

  const handleToggle = async (record: any) => {
    const currentValue = record.valueJson;
    const newValue = typeof currentValue === 'boolean' ? !currentValue : true;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `${API_URL}/feature-flags/${record.key}`,
        { valueJson: newValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Invalidate the list to refetch
      invalidate({
        resource: 'feature-flags',
        invalidates: ['list'],
      });
    } catch (error) {
      console.error('Failed to update feature flag:', error);
    }
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
