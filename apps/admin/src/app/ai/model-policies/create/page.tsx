'use client';

import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber } from 'antd';

export default function ModelPolicyCreate() {
    const { formProps, saveButtonProps } = useForm({
        resource: 'model-policies',
    });

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Plan"
                    name="plan"
                    rules={[{ required: true, message: 'Please select a plan' }]}
                >
                    <Select>
                        <Select.Option value="free">Free</Select.Option>
                        <Select.Option value="premium">Premium</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Provider"
                    name="provider"
                    rules={[{ required: true, message: 'Please select a provider' }]}
                >
                    <Select>
                        <Select.Option value="openai">OpenAI</Select.Option>
                        <Select.Option value="anthropic">Anthropic</Select.Option>
                        <Select.Option value="google">Google</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Model Name"
                    name="modelName"
                    rules={[{ required: true, message: 'Please enter model name' }]}
                >
                    <Input placeholder="e.g., gpt-4, claude-3-opus, gemini-pro" />
                </Form.Item>

                <Form.Item
                    label="Temperature"
                    name="temperature"
                    initialValue={0.7}
                    rules={[{ required: true, message: 'Please enter temperature' }]}
                >
                    <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    label="Max Tokens"
                    name="maxTokens"
                    initialValue={1024}
                    rules={[{ required: true, message: 'Please enter max tokens' }]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    label="Tools Enabled (JSON)"
                    name="toolsEnabledJson"
                    initialValue="[]"
                >
                    <Input.TextArea
                        rows={4}
                        placeholder='["memory", "health_data"]'
                    />
                </Form.Item>
            </Form>
        </Create>
    );
}
