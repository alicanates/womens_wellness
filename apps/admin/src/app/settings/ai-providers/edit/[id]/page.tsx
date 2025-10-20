'use client';

import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Switch } from 'antd';
import { useParams } from 'next/navigation';

const modelSuggestions = {
    google: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'],
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
    deepseek: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
};

export default function AIProviderEdit() {
    const params = useParams();
    const providerId = params.id as string;

    const { formProps, saveButtonProps, queryResult, form } = useForm({
        resource: 'ai-providers',
        action: 'edit',
        id: providerId,
    });

    const selectedProvider = Form.useWatch('provider', form);

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item label="Provider" name="provider">
                    <Input size="large" disabled />
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
                    tooltip="Leave empty to keep current key"
                >
                    <Input.Password size="large" placeholder="Enter new API key to change" />
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

                <Form.Item label="Active" name="isActive" valuePropName="checked">
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
            </Form>
        </Edit>
    );
}
