'use client';

import { Refine } from '@refinedev/core';
import { RefineThemes, ThemedLayoutV2, useNotificationProvider } from '@refinedev/antd';
import { ConfigProvider } from 'antd';
import routerProvider from '@refinedev/nextjs-router';
import { dataProvider } from '@/providers/dataProvider';
import { authProvider } from '@/providers/authProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import {
  UserOutlined,
  SettingOutlined,
  FlagOutlined,
  DashboardOutlined,
  FileTextOutlined,
  BellOutlined,
  CrownOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  HeartOutlined,
  CalendarOutlined,
  BulbOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={RefineThemes.Blue}>
        <Refine
          routerProvider={routerProvider}
          dataProvider={dataProvider}
          authProvider={authProvider}
          notificationProvider={useNotificationProvider}
          resources={[
            {
              name: 'dashboard',
              list: '/',
              meta: {
                label: 'Kontrol Paneli',
                icon: <DashboardOutlined />,
              },
            },
            {
              name: 'users',
              list: '/users',
              create: '/users/create',
              edit: '/users/edit/:id',
              show: '/users/show/:id',
              meta: {
                label: 'Kullanıcılar',
                icon: <UserOutlined />,
              },
            },
            {
              name: 'subscriptions',
              list: '/subscriptions',
              show: '/subscriptions/show/:id',
              meta: {
                label: 'Abonelikler',
                icon: <CrownOutlined />,
              },
            },
            {
              name: 'qna',
              meta: {
                label: 'Soru & Cevap',
                icon: <QuestionCircleOutlined />,
              },
            },
            {
              name: 'qna/questions',
              list: '/qna/questions',
              show: '/qna/questions/show/:id',
              meta: {
                label: 'Sorular',
                parent: 'qna',
              },
            },
            {
              name: 'qna/answers',
              list: '/qna/answers',
              meta: {
                label: 'Cevaplar',
                parent: 'qna',
              },
            },
            {
              name: 'qna/reports',
              list: '/qna/reports',
              show: '/qna/reports/show/:id',
              meta: {
                label: 'Raporlar',
                parent: 'qna',
              },
            },
            {
              name: 'content',
              meta: {
                label: 'İçerik Yönetimi',
                icon: <BookOutlined />,
              },
            },
            {
              name: 'content/articles',
              list: '/content/articles',
              create: '/content/articles/create',
              edit: '/content/articles/edit/:id',
              meta: {
                label: 'Makaleler',
                parent: 'content',
              },
            },
            {
              name: 'content/pages',
              list: '/pages',
              meta: {
                label: 'Sayfalar',
                parent: 'content',
              },
            },
            {
              name: 'health',
              meta: {
                label: 'Sağlık Takibi',
                icon: <HeartOutlined />,
              },
            },
            {
              name: 'health/cycles',
              list: '/health/cycles',
              show: '/health/cycles/show/:id',
              meta: {
                label: 'Regl Döngüleri',
                parent: 'health',
              },
            },
            {
              name: 'health/pregnancy',
              list: '/health/pregnancy',
              show: '/health/pregnancy/show/:id',
              meta: {
                label: 'Hamilelik',
                parent: 'health',
              },
            },
            {
              name: 'health/wellness',
              list: '/health/wellness',
              meta: {
                label: 'Wellness Verileri',
                parent: 'health',
              },
            },
            {
              name: 'reminders',
              list: '/reminders',
              meta: {
                label: 'Hatırlatıcılar',
                icon: <BellOutlined />,
              },
            },
            {
              name: 'ai',
              meta: {
                label: 'AI Yapılandırması',
                icon: <BulbOutlined />,
              },
            },
            {
              name: 'ai/model-policies',
              list: '/ai/model-policies',
              create: '/ai/model-policies/create',
              edit: '/ai/model-policies/edit/:id',
              meta: {
                label: 'Model Politikaları',
                parent: 'ai',
              },
            },
            {
              name: 'ai/quotas',
              list: '/ai/quotas',
              meta: {
                label: 'Kullanım Kotaları',
                parent: 'ai',
              },
            },
            {
              name: 'system',
              meta: {
                label: 'Sistem',
                icon: <SettingOutlined />,
              },
            },
            {
              name: 'system/feature-flags',
              list: '/system/feature-flags',
              edit: '/system/feature-flags/edit/:id',
              meta: {
                label: 'Özellik Bayrakları',
                parent: 'system',
              },
            },
            {
              name: 'system/audit-logs',
              list: '/system/audit-logs',
              meta: {
                label: 'Denetim Kayıtları',
                parent: 'system',
              },
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            projectId: 'wellness-admin',
          }}
        >
          <ThemedLayoutV2>
            {children}
          </ThemedLayoutV2>
        </Refine>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
