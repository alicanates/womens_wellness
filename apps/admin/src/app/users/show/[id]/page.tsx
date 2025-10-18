'use client';

import { Show } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Typography, Tag, Descriptions, Card, Tabs } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function UserShow() {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: 'Temel Bilgiler',
            children: (
              <>
                <Title level={5}>Kullanıcı Bilgileri</Title>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="E-posta">{record?.email}</Descriptions.Item>
                  <Descriptions.Item label="Kullanıcı Adı">{record?.username || 'Yok'}</Descriptions.Item>
                  <Descriptions.Item label="Durum">
                    <Tag color={record?.status === 'ACTIVE' ? 'green' : 'red'}>
                      {record?.status === 'ACTIVE' ? 'Aktif' : record?.status === 'SUSPENDED' ? 'Askıda' : 'Silindi'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Yetki">
                    <Tag color={record?.isAdmin ? 'purple' : 'default'}>
                      {record?.isAdmin ? 'Admin' : 'Kullanıcı'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="PIN Koruması">
                    <Tag color={record?.pinEnabled ? 'blue' : 'default'}>
                      {record?.pinEnabled ? 'Aktif' : 'Pasif'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kayıt Tarihi">
                    {dayjs(record?.createdAt).format('YYYY-MM-DD HH:mm')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Güncelleme">
                    {dayjs(record?.updatedAt).format('YYYY-MM-DD HH:mm')}
                  </Descriptions.Item>
                </Descriptions>

                {record?.profile && (
                  <>
                    <Title level={5} style={{ marginTop: 24 }}>Profil</Title>
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="Ad">{record.profile.firstName || 'Yok'}</Descriptions.Item>
                      <Descriptions.Item label="Soyad">{record.profile.lastName || 'Yok'}</Descriptions.Item>
                      <Descriptions.Item label="Görünen Ad">{record.profile.displayName || 'Yok'}</Descriptions.Item>
                      <Descriptions.Item label="Doğum Tarihi">
                        {record.profile.dateOfBirth ? dayjs(record.profile.dateOfBirth).format('YYYY-MM-DD') : 'Yok'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Boy">{record.profile.heightCm ? `${record.profile.heightCm} cm` : 'Yok'}</Descriptions.Item>
                      <Descriptions.Item label="Kilo">{record.profile.weightKg ? `${record.profile.weightKg} kg` : 'Yok'}</Descriptions.Item>
                      <Descriptions.Item label="Ülke">{record.profile.country || 'Yok'}</Descriptions.Item>
                      <Descriptions.Item label="Saat Dilimi">{record.profile.timezone || 'Yok'}</Descriptions.Item>
                    </Descriptions>
                  </>
                )}
              </>
            ),
          },
          {
            key: '2',
            label: 'Abonelik',
            children: record?.subscription ? (
              <>
                <Title level={5}>Abonelik Detayları</Title>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Durum">
                    <Tag color={record.subscription.status === 'ACTIVE' ? 'green' : 'default'}>
                      {record.subscription.status === 'ACTIVE' ? 'Aktif' : record.subscription.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Seviye">{record.subscription.tier === 'MONTHLY' ? 'Aylık' : record.subscription.tier === 'YEARLY' ? 'Yıllık' : 'Yok'}</Descriptions.Item>
                  <Descriptions.Item label="Sağlayıcı">{record.subscription.provider === 'APPLE' ? 'Apple' : record.subscription.provider === 'GOOGLE' ? 'Google' : 'Yok'}</Descriptions.Item>
                  <Descriptions.Item label="AI Mesajları">
                    {record.subscription.aiMessagesUsed} / {record.subscription.aiMessagesLimit}
                  </Descriptions.Item>
                  <Descriptions.Item label="Başlangıç">
                    {record.subscription.startDate ? dayjs(record.subscription.startDate).format('YYYY-MM-DD') : 'Yok'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Bitiş">
                    {record.subscription.endDate ? dayjs(record.subscription.endDate).format('YYYY-MM-DD') : 'Yok'}
                  </Descriptions.Item>
                </Descriptions>
              </>
            ) : (
              <Card>Abonelik verisi yok</Card>
            ),
          },
          {
            key: '3',
            label: 'Sağlık Verileri',
            children: (
              <Card>
                <p><strong>Regl Döngüleri:</strong> {record?._count?.periodCycles || 0}</p>
                <p><strong>Günlük Kayıtlar:</strong> {record?._count?.dailyLogs || 0}</p>
                <p><strong>Su Kayıtları:</strong> {record?._count?.waterLogs || 0}</p>
                <p><strong>Hamilelik:</strong> {record?.pregnancy ? 'Aktif' : 'Yok'}</p>
                <p><strong>Hatırlatıcılar:</strong> {record?._count?.reminders || 0}</p>
              </Card>
            ),
          },
          {
            key: '4',
            label: 'Aktivite',
            children: (
              <Card>
                <p><strong>Konuşmalar:</strong> {record?._count?.conversations || 0}</p>
                <p><strong>Sorular:</strong> {record?._count?.questions || 0}</p>
                <p><strong>Cevaplar:</strong> {record?._count?.answers || 0}</p>
                <p><strong>Görüntülenen Makaleler:</strong> {record?._count?.articleInteractions || 0}</p>
              </Card>
            ),
          },
        ]}
      />
    </Show>
  );
}
