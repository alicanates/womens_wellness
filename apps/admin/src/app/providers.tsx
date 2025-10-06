'use client';

import { Refine } from '@refinedev/core';
import { RefineThemes, ThemedLayoutV2, useNotificationProvider } from '@refinedev/antd';
import { ConfigProvider } from 'antd';
import routerProvider from '@refinedev/nextjs-router';
import { dataProvider } from '@/providers/dataProvider';
import { authProvider } from '@/providers/authProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

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
              name: 'users',
              list: '/users',
              create: '/users/create',
              edit: '/users/edit/:id',
              show: '/users/show/:id',
              meta: {
                label: 'Users',
              },
            },
            {
              name: 'model-policies',
              list: '/model-policies',
              create: '/model-policies/create',
              edit: '/model-policies/edit/:id',
              meta: {
                label: 'Model Policies',
              },
            },
            {
              name: 'feature-flags',
              list: '/feature-flags',
              edit: '/feature-flags/edit/:id',
              meta: {
                label: 'Feature Flags',
              },
            },
            {
              name: 'quotas',
              list: '/quotas',
              meta: {
                label: 'Usage Quotas',
              },
            },
            {
              name: 'reminders',
              list: '/reminders',
              meta: {
                label: 'Reminders',
              },
            },
            {
              name: 'audit-logs',
              list: '/audit-logs',
              meta: {
                label: 'Audit Logs',
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
