'use client';

import { useShow } from '@refinedev/core';
import { Show } from '@refinedev/antd';
import { Typography, Descriptions, Tag, Card, Tabs } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function PregnancyShow() {
    const { queryResult } = useShow({
        resource: 'pregnancy/admin',
    });

    const { data, isLoading } = queryResult;
    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Tabs
                defaultActiveKey="1"
                items={[
                    {
                        key: '1',
                        label: 'Basic Info',
                        children: (
                            <>
                                <Title level={5}>Pregnancy Information</Title>
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item label="User Email">{record?.user?.email}</Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        <Tag color={record?.isActive ? 'green' : 'default'}>
                                            {record?.isActive ? 'Active' : 'Inactive'}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Week">{record?.weekCache || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Trimester">{record?.trimester || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="LMP Date">
                                        {record?.lmpDate ? dayjs(record.lmpDate).format('YYYY-MM-DD') : 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Due Date">
                                        {record?.dueDate ? dayjs(record.dueDate).format('YYYY-MM-DD') : 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Anonymous Mode">
                                        {record?.anonymousMode ? 'Yes' : 'No'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </>
                        ),
                    },
                    {
                        key: '2',
                        label: 'Appointments',
                        children: record?.appointments && record.appointments.length > 0 ? (
                            <Card>
                                {record.appointments.map((apt: any) => (
                                    <Card key={apt.id} type="inner" style={{ marginBottom: 8 }}>
                                        <p><strong>Date:</strong> {dayjs(apt.appointmentAt).format('YYYY-MM-DD HH:mm')}</p>
                                        <p><strong>Clinic:</strong> {apt.clinic || 'N/A'}</p>
                                        <p><strong>Doctor:</strong> {apt.doctorName || 'N/A'}</p>
                                        {apt.notes && <p><strong>Notes:</strong> {apt.notes}</p>}
                                    </Card>
                                ))}
                            </Card>
                        ) : (
                            <Card>No appointments</Card>
                        ),
                    },
                    {
                        key: '3',
                        label: 'Medications',
                        children: record?.medications && record.medications.length > 0 ? (
                            <Card>
                                {record.medications.map((med: any) => (
                                    <Card key={med.id} type="inner" style={{ marginBottom: 8 }}>
                                        <p><strong>Name:</strong> {med.name}</p>
                                        <p><strong>Dosage:</strong> {med.dosage || 'N/A'}</p>
                                        <p><strong>Frequency:</strong> {med.frequency || 'N/A'}</p>
                                        <p><strong>Safety Rating:</strong> {med.safetyRating || 'N/A'}</p>
                                    </Card>
                                ))}
                            </Card>
                        ) : (
                            <Card>No medications</Card>
                        ),
                    },
                ]}
            />
        </Show>
    );
}
