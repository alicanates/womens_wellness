'use client';

import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Checkbox } from 'antd';

const AVAILABLE_TOOLS = [
  'get_user_metrics',
  'log_water',
  'get_next_period_prediction',
  'create_reminder',
  'get_quota',
];

export default function ModelPolicyCreate() {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Plan"
          name="plan"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: 'Free', value: 'free' },
              { label: 'Premium', value: 'premium' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Provider"
          name="provider"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: 'OpenAI', value: 'openai' },
              { label: 'Anthropic', value: 'anthropic' },
              { label: 'Google', value: 'google' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Model Name"
          name="modelName"
          rules={[{ required: true }]}
          help="e.g., gpt-4o-mini, claude-3.5-sonnet, gemini-pro"
        >
          <Input placeholder="gpt-4o-mini" />
        </Form.Item>

        <Form.Item
          label="Temperature"
          name="temperature"
          rules={[{ required: true, type: 'number', min: 0, max: 2 }]}
          help="0.0 to 2.0 (lower = more focused, higher = more creative)"
          initialValue={0.7}
        >
          <InputNumber
            min={0}
            max={2}
            step={0.1}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Max Tokens"
          name="maxTokens"
          rules={[{ required: true, type: 'number', min: 1 }]}
          help="Maximum tokens for completion"
          initialValue={1024}
        >
          <InputNumber
            min={1}
            max={16000}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Enabled Tools"
          name="toolsEnabledJson"
          help="Select which tools the AI can use"
          initialValue={AVAILABLE_TOOLS}
        >
          <Checkbox.Group
            options={AVAILABLE_TOOLS.map(tool => ({
              label: tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              value: tool,
            }))}
          />
        </Form.Item>
      </Form>
    </Create>
  );
}
