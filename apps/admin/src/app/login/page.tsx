'use client';

import { AuthPage } from '@refinedev/antd';

export default function LoginPage() {
  return (
    <AuthPage
      type="login"
      title="Wellness Admin"
      formProps={{
        initialValues: {
          email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@wellness.local',
          password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123',
        },
      }}
    />
  );
}
