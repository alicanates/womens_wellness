'use client';

import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Switch } from 'antd';
import { useList } from '@refinedev/core';

const planOptions = [
    { label: 'Free', value: 'free' },
    { label: 'Premium', value: 'premium' },
];

export default function ModelPolicyCreate() {
    const { formProps, saveButtonProps } = useForm({
        resource: 'model-policies',
        action: 'create',
    });

    // Fetch available AI providers
    const { data: providersData } = useList({
        resource: 'ai-providers',
        pagination: { mode: 'off' },
    });

    const providers = providersData?.data || [];

    const providerOptions = providers
        .filter((p: any) => p.isActive)
        .map((p: any) => ({
            label: `${getProviderIcon(p.provider)} ${p.displayName}`,
            value: p.provider,
            modelName: p.modelName,
        }));

    function getProviderIcon(provider: string) {
        const icons: Record<string, string> = {
            google: '🔷',
            openai: '🤖',
            anthropic: '🧠',
            deepseek: '⚡',
        };
        return icons[provider] || '❓';
    }

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Subscription Plan"
                    name="plan"
                    rules={[{ required: true, message: 'Please select a plan' }]}
                >
                    <Select
                        size="large"
                        options={planOptions}
                        placeholder="Select subscription plan"
                    />
                </Form.Item>

                <Form.Item
                    label="AI Provider"
                    name="provider"
                    rules={[{ required: true, message: 'Please select a provider' }]}
                >
                    <Select
                        size="large"
                        options={providerOptions}
                        placeholder="Select AI provider"
                        onChange={(value) => {
                            // Auto-fill model name from selected provider
                            const selectedProvider = providers.find((p: any) => p.provider === value);
                            if (selectedProvider) {
                                formProps.form?.setFieldValue('modelName', selectedProvider.modelName);
                            }
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label="Model Name"
                    name="modelName"
                    rules={[{ required: true, message: 'Please enter model name' }]}
                >
                    <Input size="large" placeholder="e.g., gemini-2.5-flash" />
                </Form.Item>

                <Form.Item
                    label="Temperature"
                    name="temperature"
                    initialValue={0.7}
                    rules={[{ required: true, message: 'Please enter temperature' }]}
                    tooltip="Controls randomness (0.0 = deterministic, 1.0 = very random)"
                >
                    <InputNumber
                        size="large"
                        min={0}
                        max={2}
                        step={0.1}
                        style={{ width: '100%' }}
                        placeholder="0.0 - 2.0"
                    />
                </Form.Item>

                <Form.Item
                    label="Max Tokens"
                    name="maxTokens"
                    initialValue={1024}
                    rules={[{ required: true, message: 'Please enter max tokens' }]}
                    tooltip="Maximum number of tokens in the response"
                >
                    <InputNumber
                        size="large"
                        min={1}
                        max={32000}
                        style={{ width: '100%' }}
                        placeholder="1 - 32000"
                    />
                </Form.Item>

                <Form.Item
                    label="Tools Enabled"
                    name="toolsEnabledJson"
                    initialValue="[]"
                    tooltip="JSON array of enabled tools (e.g., ['web_search', 'calculator'])"
                >
                    <Input.TextArea
                        rows={3}
                        placeholder='["web_search", "calculator"]'
                    />
                </Form.Item>
            </Form>
        </Create>
    );
}