'use client';

import { List, useTable, EditButton, ShowButton, DeleteButton, DateField } from '@refinedev/antd';
import { Table, Space, Tag } from 'antd';

export default function UserList() {
  const { tableProps } = useTable({
    resource: 'users',
    syncWithLocation: true,
  });

  const columns = [
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Kullanıcı Adı',
      dataIndex: 'username',
      key: 'username',
      render: (value: string) => value || '-',
    },
    {
      title: 'Görünen Ad',
      dataIndex: ['profile', 'displayName'],
      key: 'displayName',
      render: (value: string) => value || '-',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => {
        const labels: Record<string, string> = {
          ACTIVE: 'Aktif',
          SUSPENDED: 'Askıya Alındı',
          DELETED: 'Silindi',
        };
        return (
          <Tag color={value === 'ACTIVE' ? 'green' : value === 'SUSPENDED' ? 'orange' : 'red'}>
            {labels[value] || value}
          </Tag>
        );
      },
    },
    {
      title: 'Yetki',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (value: boolean) => (
        <Tag color={value ? 'purple' : 'default'}>
          {value ? 'Admin' : 'Kullanıcı'}
        </Tag>
      ),
    },
    {
      title: 'Abonelik',
      dataIndex: ['subscription', 'status'],
      key: 'subscription',
      render: (value: string) => {
        if (!value) return <Tag>ÜCRETSİZ</Tag>;
        const labels: Record<string, string> = {
          FREE: 'Ücretsiz',
          TRIAL: 'Deneme',
          ACTIVE: 'Aktif',
          EXPIRED: 'Süresi Doldu',
          CANCELLED: 'İptal Edildi',
        };
        return <Tag color={value === 'ACTIVE' ? 'gold' : 'default'}>{labels[value] || value}</Tag>;
      },
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => <DateField value={value} format="YYYY-MM-DD" />,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <ShowButton hideText size="small" recordItemId={record.id} />
          <EditButton hideText size="small" recordItemId={record.id} />
          <DeleteButton hideText size="small" recordItemId={record.id} />
        </Space>
      ),
    },
  ];

  return (
    <List>
      <Table {...tableProps} columns={columns} rowKey="id" />
    </List>
  );
}
