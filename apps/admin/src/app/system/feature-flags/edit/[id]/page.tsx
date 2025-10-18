'use client';

import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Switch } from 'antd';

export default function FeatureFlagEdit() {
    const { formProps, saveButtonProps, queryResult } = useForm({
        resource: 'feature-flags',
    });

    const record = queryResult?.data?.data;
    const isBooleanValue = typeof record?.valueJson === 'boolean';

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item label="Key" name="key">
                    <Input disabled />
                </Form.Item>

                {isBooleanValue ? (
                    <Form.Item
                        label="Enabled"
                        name="valueJson"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                ) : (
                    <Form.Item
                        label="Value (JSON)"
                        name="valueJson"
                        rules={[{ required: true, message: 'Please enter a value' }]}
                    >
                        <Input.TextArea
                            rows={6}
                            placeholder='{"enabled": true, "config": {}}'
                        />
                    </Form.Item>
                )}
            </Form>
        </Edit>
    );
}
