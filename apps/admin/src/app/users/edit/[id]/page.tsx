'use client';

import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';

export default function UserEdit() {
  const { formProps, saveButtonProps } = useForm({
    resource: 'users',
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              type: 'email',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Suspended', value: 'SUSPENDED' },
              { label: 'Deleted', value: 'DELETED' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          help="Leave blank to keep current password"
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Edit>
  );
}
