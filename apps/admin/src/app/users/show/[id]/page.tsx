'use client';

import { Show, TextField, DateField, EmailField } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Typography, Tag } from 'antd';

const { Title } = Typography;

export default function UserShow() {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>ID</Title>
      <TextField value={record?.id} />

      <Title level={5}>Email</Title>
      <EmailField value={record?.email} />

      <Title level={5}>Status</Title>
      <Tag color={record?.status === 'ACTIVE' ? 'green' : 'red'}>
        {record?.status}
      </Tag>

      <Title level={5}>Created At</Title>
      <DateField value={record?.createdAt} format="LLL" />

      <Title level={5}>Profile</Title>
      {record?.profile ? (
        <div>
          <p><strong>Display Name:</strong> {record.profile.displayName || 'N/A'}</p>
          <p><strong>Birth Date:</strong> {
            record.profile.birthDay && record.profile.birthMonth && record.profile.birthYear
              ? `${record.profile.birthDay}/${record.profile.birthMonth}/${record.profile.birthYear}`
              : record.profile.birthYear
                ? `Year: ${record.profile.birthYear}`
                : 'N/A'
          }</p>
          <p><strong>Height:</strong> {record.profile.heightCm ? `${record.profile.heightCm} cm` : 'N/A'}</p>
          <p><strong>Weight:</strong> {record.profile.weightKg ? `${record.profile.weightKg} kg` : 'N/A'}</p>
          <p><strong>Country:</strong> {record.profile.country || 'N/A'}</p>
          <p><strong>Timezone:</strong> {record.profile.timezone || 'N/A'}</p>
        </div>
      ) : (
        <p>No profile data</p>
      )}

      <Title level={5}>Subscription</Title>
      {record?.subscription ? (
        <div>
          <p><strong>Plan:</strong> <Tag>{record.subscription.plan.toUpperCase()}</Tag></p>
          <p><strong>Status:</strong> <Tag color={record.subscription.status === 'active' ? 'green' : 'orange'}>{record.subscription.status}</Tag></p>
          <p><strong>Renews At:</strong> <DateField value={record.subscription.renewsAt} format="LLL" /></p>
        </div>
      ) : (
        <p>No subscription data</p>
      )}
    </Show>
  );
}
