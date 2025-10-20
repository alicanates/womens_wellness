'use client';

import { useTable, DeleteButton, EditButton, ShowButton } from '@refinedev/antd';
import { List } from '@refinedev/antd';
import { Table, Tag, Space, Typography } from 'antd';
import { StarOutlined, CommentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

export default function AnswersList() {
    const { tableProps } = useTable({
        resource: 'qna/answers',
        syncWithLocation: true,
    });

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            ellipsis: true,
            render: (text: string) => (
                <Text copyable style={{ fontSize: '12px' }}>
                    {text.substring(0, 8)}...
                </Text>
            ),
        },
        {
            title: 'İçerik',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
            width: 300,
            render: (text: string) => (
                <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                    {text}
                </Paragraph>
            ),
        },
        {
            title: 'Soru',
            dataIndex: ['question', 'title'],
            key: 'question',
            ellipsis: true,
            width: 200,
            render: (text: string, record: any) => {
                if (!record.question?.id || !text) {
                    return <Text type="secondary">Soru bulunamadı</Text>;
                }
                return (
                    <a href={`/qna/questions/show/${record.question.id}`} target="_blank" rel="noopener noreferrer">
                        {text}
                    </a>
                );
            },
        },
        {
            title: 'Yazar',
            key: 'author',
            width: 150,
            render: (record: any) => {
                const displayName = record.user?.displayName || record.user?.username || 'Anonim';
                const email = record.user?.email || '-';
                return (
                    <Space direction="vertical" size={0}>
                        <Text strong>{displayName}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {email}
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: 'Durum',
            key: 'status',
            width: 120,
            render: (record: any) => {
                const commentCount = record._count?.comments ?? 0;
                return (
                    <Space direction="vertical" size={2}>
                        {record.isBestAnswer && (
                            <Tag icon={<StarOutlined />} color="gold">
                                En İyi Cevap
                            </Tag>
                        )}
                        {commentCount > 0 && (
                            <Tag icon={<CommentOutlined />} color="blue">
                                {commentCount} Yorum
                            </Tag>
                        )}
                        {!record.isBestAnswer && commentCount === 0 && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                Yorum yok
                            </Text>
                        )}
                    </Space>
                );
            },
        },
        {
            title: 'Oylar',
            dataIndex: 'voteCount',
            key: 'voteCount',
            width: 80,
            align: 'center' as const,
            render: (count: number) => {
                const voteCount = count ?? 0;
                return (
                    <Tag color={voteCount > 0 ? 'green' : voteCount < 0 ? 'red' : 'default'}>
                        {voteCount > 0 ? `+${voteCount}` : voteCount}
                    </Tag>
                );
            },
        },
        {
            title: 'Tarih',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date: string) => (
                <Space direction="vertical" size={0}>
                    <Text>{dayjs(date).format('DD.MM.YYYY')}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {dayjs(date).format('HH:mm')}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'İşlemler',
            key: 'actions',
            width: 200,
            fixed: 'right' as const,
            render: (_: any, record: any) => (
                <Space size="small">
                    <ShowButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                    />
                    <EditButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                    />
                    <DeleteButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                        confirmTitle="Cevabı silmek istediğinize emin misiniz?"
                        confirmOkText="Evet"
                        confirmCancelText="Hayır"
                    />
                </Space>
            ),
        },
    ];

    return (
        <List>
            <Table
                {...tableProps}
                columns={columns}
                rowKey="id"
                scroll={{ x: 1200 }}
            />
        </List>
    );
}
