'use client';

import { Edit, useForm } from '@refinedev/antd';
import { Form, Input } from 'antd';

export default function AnswerEdit() {
    const { formProps, saveButtonProps, queryResult } = useForm({
        resource: 'qna/answers',
    });

    return (
        <Edit saveButtonProps={saveButtonProps} isLoading={queryResult?.isLoading}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Cevap İçeriği"
                    name="content"
                    rules={[
                        {
                            required: true,
                            message: 'Cevap içeriği zorunludur',
                        },
                        {
                            min: 10,
                            message: 'Cevap en az 10 karakter olmalıdır',
                        },
                    ]}
                >
                    <Input.TextArea
                        rows={10}
                        placeholder="Cevap içeriğini buraya yazın..."
                    />
                </Form.Item>
            </Form>
        </Edit>
    );
}
