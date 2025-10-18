'use client';

import { useShow, useUpdate } from '@refinedev/core';
import { Show } from '@refinedev/antd';
import { Typography, Descriptions, Tag, Card, Button, Space, message } from 'antd';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

export default function QuestionShow() {
    const { queryResult } = useShow({
        resource: 'qna/questions',
    });

    const { mutate: updateQuestion } = useUpdate();

    const { data, isLoading } = queryResult;
    const record = data?.data;

    const handleStatusChange = (newStatus: string) => {
        updateQuestion(
            {
                resource: 'qna/questions',
                id: record?.id,
                values: { status: newStatus },
            },
            {
                onSuccess: () => {
                    message.success('Soru durumu güncellendi');
                    queryResult.refetch();
                },
            }
        );
    };

    const statusLabels: Record<string, string> = {
        OPEN: 'Açık',
        ANSWERED: 'Cevaplandı',
        CLOSED: 'Kapalı',
    };

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>Soru Detayları</Title>
            <Descriptions bordered column={2}>
                <Descriptions.Item label="Başlık" span={2}>{record?.title}</Descriptions.Item>
                <Descriptions.Item label="Kategori">
                    <Tag>{record?.category}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                    <Tag color={record?.status === 'OPEN' ? 'blue' : 'green'}>
                        {statusLabels[record?.status] || record?.status}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Yazar">
                    {record?.isAnonymous ? 'Anonim' : record?.user?.email}
                </Descriptions.Item>
                <Descriptions.Item label="Premium Kullanıcı">
                    {record?.isPremium ? 'Evet' : 'Hayır'}
                </Descriptions.Item>
                <Descriptions.Item label="Görüntülenme">{record?.viewCount || 0}</Descriptions.Item>
                <Descriptions.Item label="Oluşturulma">
                    {dayjs(record?.createdAt).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Etiketler" span={2}>
                    {record?.tags?.map((tag: string) => <Tag key={tag}>{tag}</Tag>)}
                </Descriptions.Item>
            </Descriptions>

            <Card title="İçerik" style={{ marginTop: 16 }}>
                <Paragraph>{record?.content}</Paragraph>
            </Card>

            <Card title="İşlemler" style={{ marginTop: 16 }}>
                <Space>
                    <Button onClick={() => handleStatusChange('OPEN')}>Açık Olarak İşaretle</Button>
                    <Button onClick={() => handleStatusChange('ANSWERED')}>Cevaplandı Olarak İşaretle</Button>
                    <Button onClick={() => handleStatusChange('CLOSED')}>Soruyu Kapat</Button>
                </Space>
            </Card>

            {record?.answers && record.answers.length > 0 && (
                <Card title={`Cevaplar (${record.answers.length})`} style={{ marginTop: 16 }}>
                    {record.answers.map((answer: any) => (
                        <Card key={answer.id} type="inner" style={{ marginBottom: 8 }}>
                            <Paragraph>{answer.content}</Paragraph>
                            <Space>
                                <Tag color={answer.isBestAnswer ? 'gold' : 'default'}>
                                    {answer.isBestAnswer ? 'En İyi Cevap' : 'Cevap'}
                                </Tag>
                                <span>Oylar: {answer.voteCount}</span>
                                <span>Yazan: {answer.user?.email}</span>
                            </Space>
                        </Card>
                    ))}
                </Card>
            )}
        </Show>
    );
}
