'use client';

import { useShow } from '@refinedev/core';
import { Show } from '@refinedev/antd';
import { Typography, Space, Tag, Card, Descriptions, Button, Divider } from 'antd';
import { StarOutlined, CommentOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

export default function AnswerShow() {
    const router = useRouter();
    const { queryResult } = useShow({
        resource: 'qna/answers',
    });

    const { data, isLoading } = queryResult;
    const record = data?.data;

    if (isLoading || !record) {
        return <Show isLoading={true} />;
    }

    return (
        <Show isLoading={false}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                style={{ marginBottom: 16 }}
            >
                Geri
            </Button>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header */}
                <Card>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                            <Text type="secondary">Cevap ID</Text>
                            <br />
                            <Text copyable strong>{record.id}</Text>
                        </div>

                        <Space size="middle">
                            {record.isBestAnswer && (
                                <Tag icon={<StarOutlined />} color="gold" style={{ fontSize: 14, padding: '4px 12px' }}>
                                    En İyi Cevap
                                </Tag>
                            )}
                            <Tag color={record.voteCount > 0 ? 'green' : record.voteCount < 0 ? 'red' : 'default'}>
                                {record.voteCount > 0 ? `+${record.voteCount}` : record.voteCount} Oy
                            </Tag>
                            <Tag icon={<CommentOutlined />} color="blue">
                                {record._count?.comments || 0} Yorum
                            </Tag>
                        </Space>
                    </Space>
                </Card>

                {/* Question Info */}
                <Card title="İlgili Soru">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                            <Text strong>Soru Başlığı:</Text>
                            <br />
                            <Text style={{ fontSize: 16 }}>
                                {record.question?.title || 'Bilinmiyor'}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary">Soru ID: {record.question?.id || '-'}</Text>
                        </div>
                    </Space>
                </Card>

                {/* Answer Content */}
                <Card title="Cevap İçeriği">
                    <Paragraph style={{
                        fontSize: 16,
                        lineHeight: 1.8,
                        padding: 16,
                        background: '#f5f5f5',
                        borderRadius: 8,
                        whiteSpace: 'pre-wrap'
                    }}>
                        {record.content}
                    </Paragraph>
                </Card>

                {/* Author Info */}
                <Card title="Yazar Bilgileri">
                    <Descriptions column={1}>
                        <Descriptions.Item label="İsim">
                            {record.user?.displayName || 'Anonim'}
                        </Descriptions.Item>
                        <Descriptions.Item label="E-posta">
                            {record.user?.email || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kullanıcı Adı">
                            {record.user?.username || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kullanıcı ID">
                            <Text copyable>{record.user?.id || '-'}</Text>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Statistics */}
                <Card title="İstatistikler">
                    <Descriptions column={2}>
                        <Descriptions.Item label="Oy Sayısı">
                            <Tag color={record.voteCount > 0 ? 'green' : record.voteCount < 0 ? 'red' : 'default'}>
                                {record.voteCount > 0 ? `+${record.voteCount}` : record.voteCount}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Yorum Sayısı">
                            <Tag icon={<CommentOutlined />} color="blue">
                                {record._count?.comments || 0}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="En İyi Cevap">
                            {record.isBestAnswer ? (
                                <Tag icon={<StarOutlined />} color="gold">Evet</Tag>
                            ) : (
                                <Tag>Hayır</Tag>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Timestamps */}
                <Card title="Tarih Bilgileri">
                    <Descriptions column={2}>
                        <Descriptions.Item label="Oluşturulma">
                            {record.createdAt ? dayjs(record.createdAt).format('DD.MM.YYYY HH:mm:ss') : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Son Güncelleme">
                            {record.updatedAt ? dayjs(record.updatedAt).format('DD.MM.YYYY HH:mm:ss') : '-'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </Space>
        </Show>
    );
}
