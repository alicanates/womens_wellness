'use client';

import { useTable } from '@refinedev/antd';
import { List } from '@refinedev/antd';
import { Table, Tag, Switch } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function RemindersList() {
  const { tableProps, tableQueryResult } = useTable({
    resource: 'reminders',
    syncWithLocation: true,
  });

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `${API_URL}/reminders/${id}`,
        { active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      tableQueryResult?.refetch();
    } catch (error) {
      console.error('Hatırlatıcı güncellenemedi:', error);
    }
  };

  const typeLabels: Record<string, string> = {
    DAILY: 'Günlük',
    WEEKLY: 'Haftalık',
    MONTHLY: 'Aylık',
    CUSTOM: 'Özel',
  };

  const columns = [
    {
      title: 'Kullanıcı E-postası',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{typeLabels[type] || type}</Tag>,
    },
    {
      title: 'Sonraki Çalışma',
      dataIndex: 'nextRunAt',
      key: 'nextRunAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Aktif',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: any) => (
        <Switch
          checked={active}
          onChange={(checked) => handleToggleActive(record.id, checked)}
        />
      ),
    },
    {
      title: 'Veri',
      dataIndex: 'payloadJson',
      key: 'payloadJson',
      render: (payload: any) => (
        <code style={{ fontSize: 11 }}>{JSON.stringify(payload).substring(0, 50)}...</code>
      ),
    },
  ];

  return (
    <List>
      <Table {...tableProps} columns={columns} rowKey="id" />
    </List>
  );
}
