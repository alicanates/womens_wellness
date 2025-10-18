'use client';

import { AuthPage } from '@refinedev/antd';

export default function LoginPage() {
  return (
    <AuthPage
      type="login"
      title="Wellness Yönetim Paneli"
      formProps={{
        initialValues: {
          email: 'admin@wellness.local',
          password: 'admin123',
        },
      }}
      renderContent={(content) => {
        return (
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            {content}
            <div style={{ marginTop: 16, textAlign: 'center', color: '#666' }}>
              <p>Wellness uygulamanızı yönetin</p>
            </div>
          </div>
        );
      }}
    />
  );
}
