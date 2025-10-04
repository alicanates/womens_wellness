'use client';

import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Switch, InputNumber, Select } from 'antd';
import { useState } from 'react';

export default function FeatureFlagEdit() {
  const { formProps, saveButtonProps, queryResult } = useForm();
  const [valueType, setValueType] = useState<'boolean' | 'number' | 'string' | 'object'>('boolean');

  const record = queryResult?.data?.data;

  // Detect value type from existing data
  useState(() => {
    if (record?.valueJson !== undefined) {
      const type = typeof record.valueJson;
      if (type === 'boolean' || type === 'number' || type === 'string') {
        setValueType(type as any);
      } else {
        setValueType('object');
      }
    }
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Key"
          name="key"
          rules={[{ required: true }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Value Type"
          help="Change this to update the value input type"
        >
          <Select
            value={valueType}
            onChange={setValueType}
            options={[
              { label: 'Boolean', value: 'boolean' },
              { label: 'Number', value: 'number' },
              { label: 'String', value: 'string' },
              { label: 'JSON Object', value: 'object' },
            ]}
          />
        </Form.Item>

        {valueType === 'boolean' && (
          <Form.Item
            label="Enabled"
            name="valueJson"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        )}

        {valueType === 'number' && (
          <Form.Item
            label="Value"
            name="valueJson"
            rules={[{ required: true, type: 'number' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        )}

        {valueType === 'string' && (
          <Form.Item
            label="Value"
            name="valueJson"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        )}

        {valueType === 'object' && (
          <Form.Item
            label="Value (JSON)"
            name="valueJson"
            rules={[
              { required: true },
              {
                validator: (_, value) => {
                  try {
                    if (typeof value === 'string') {
                      JSON.parse(value);
                    }
                    return Promise.resolve();
                  } catch {
                    return Promise.reject('Invalid JSON');
                  }
                },
              },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder='{"key": "value"}'
            />
          </Form.Item>
        )}
      </Form>
    </Edit>
  );
}
