'use client';

import { AuthPage } from '@refinedev/antd';

export default function LoginPage() {
  return (
    <AuthPage
      type="login"
      title="Wellness Admin"
      formProps={{
        initialValues: {
          email: 'test123@test.com',
          password: 'testpass123',
        },
      }}
    />
  );
}
