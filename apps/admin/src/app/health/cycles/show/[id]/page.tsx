'use client';

import { useShow } from '@refinedev/core';
import { Show } from '@refinedev/antd';
import { Typography, Descriptions, Card } from 'antd';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

export default function CycleShow() {
    const { queryResult } = useShow({
        resource: 'cycles',
    });

    const { data, isLoading } = queryResult;
    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>Cycle Details</Title>
            <Descriptions bordered column={2}>
                <Descriptions.Item label="User Email">{record?.user?.email}</Descriptions.Item>
                <Descriptions.Item label="Start Date">
                    {dayjs(record?.startDate).format('YYYY-MM-DD')}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                    {record?.endDate ? dayjs(record.endDate).format('YYYY-MM-DD') : 'Ongoing'}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                    {record?.endDate
                        ? `${dayjs(record.endDate).diff(dayjs(record.startDate), 'day')} days`
                        : 'Ongoing'}
                </Descriptions.Item>
            </Descriptions>

            {record?.notes && (
                <Card title="Notes" style={{ marginTop: 16 }}>
                    <Paragraph>{record.notes}</Paragraph>
                </Card>
            )}

            {record?.symptomsJson && (
                <Card title="Symptoms" style={{ marginTop: 16 }}>
                    <pre>{JSON.stringify(record.symptomsJson, null, 2)}</pre>
                </Card>
            )}
        </Show>
    );
}
