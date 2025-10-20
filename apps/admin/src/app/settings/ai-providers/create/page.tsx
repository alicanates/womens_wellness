'use client';

import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Switch } from 'antd';

const providerOptions = [
    { label: '🔷 Google Gemini', value: 'google' },
    { label: '🤖 OpenAI', value: 'openai' },
    { label: '🧠 Anthropic', value: 'anthropic' },
    { label: '⚡ DeepSeek', value: 'deepseek' },
];

const modelSuggestions = {
    google: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'],
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
    deepseek: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
};

export default function AIProviderCreate() {
    const { formProps, saveButtonProps, form } = useForm({
        resource: 'ai-providers',
        action: 'create',
    });

    const selectedProvider = Form.useWatch('provider', form);

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Provider"
                    name="provider"
                    rules={[{ required: true, message: 'Please select a provider' }]}
                >
                    <Select
                        size="large"
                        options={providerOptions}
                        placeholder="Select AI provider"
                    />
                </Form.Item>

                <Form.Item
                    label="Model Name"
                    name="modelName"
                    rules={[{ required: true, message: 'Please enter model name' }]}
                >
                    <Select
                        size="large"
                        showSearch
                        placeholder="Select or type model name"
                        options={
                            selectedProvider
                                ? modelSuggestions[selectedProvider as keyof typeof modelSuggestions]?.map((m) => ({
                                    label: m,
                                    value: m,
                                }))
                                : []
                        }
                    />
                </Form.Item>

                <Form.Item
                    label="API Key"
                    name="apiKey"
                    rules={[
                        { required: true, message: 'Please enter API key' },
                        { min: 10, message: 'API key must be at least 10 characters' },
                    ]}
                >
                    <Input.Password size="large" placeholder="Enter API key" />
                </Form.Item>

                <Form.Item
                    label="Display Name"
                    name="displayName"
                    rules={[{ required: true, message: 'Please enter display name' }]}
                >
                    <Input size="large" placeholder="e.g., Google Gemini 2.5 Flash" />
                </Form.Item>

                <Form.Item label="Description" name="description">
                    <Input.TextArea rows={3} placeholder="Optional description" />
                </Form.Item>

                <Form.Item
                    label="Priority"
                    name="priority"
                    initialValue={0}
                    rules={[{ required: true, message: 'Please enter priority' }]}
                    tooltip="Higher priority providers are used first"
                >
                    <InputNumber
                        size="large"
                        min={0}
                        max={1000}
                        style={{ width: '100%' }}
                        placeholder="0-1000"
                    />
                </Form.Item>

                <Form.Item
                    label="Active"
                    name="isActive"
                    valuePropName="checked"
                    initialValue={true}
                >
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
            </Form>
        </Create>
    );
}
