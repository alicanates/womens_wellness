'use client';

import { useShow, useUpdate, useOne } from '@refinedev/core';
import { Show } from '@refinedev/antd';
import { Typography, Descriptions, Tag, Card, Button, Space, message, Alert, Spin, Input, Modal, Select } from 'antd';
import { EyeOutlined, DeleteOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function ReportShow() {
    const params = useParams();
    const reportId = params?.id as string;

    const { queryResult } = useShow({
        resource: 'qna/moderation/reports',
        id: reportId,
        meta: {
            populate: ['reporter', 'reviewer'],
        },
    });

    const { mutate: updateReport } = useUpdate();
    const [reportedContent, setReportedContent] = useState<any>(null);
    const [loadingContent, setLoadingContent] = useState(false);

    const { data, isLoading } = queryResult;
    const record = data?.data;

    // Debug
    useEffect(() => {
        console.log('Report data:', { data, record, isLoading });
    }, [data, record, isLoading]);

    // Raporlanan içeriği yükle
    useEffect(() => {
        if (record?.contentId && record?.contentType) {
            loadReportedContent();
        }
    }, [record]);

    const loadReportedContent = async () => {
        if (!record) return;

        setLoadingContent(true);
        try {
            let resource = '';
            switch (record.contentType) {
                case 'QUESTION':
                    resource = 'qna/questions';
                    break;
                case 'ANSWER':
                    resource = 'qna/answers';
                    break;
                case 'COMMENT':
                    resource = 'qna/comments';
                    break;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`${apiUrl}/${resource}/${record.contentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                // API might return data directly or wrapped in a data property
                setReportedContent(data.data || data);
            }
        } catch (error) {
            console.error('İçerik yüklenirken hata:', error);
        } finally {
            setLoadingContent(false);
        }
    };

    const [moderatorNote, setModeratorNote] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [pendingAction, setPendingAction] = useState<'HIDE' | 'DELETE' | 'DISMISS' | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');

    const handleReview = (action: 'HIDE' | 'DELETE' | 'DISMISS') => {
        setPendingAction(action);
        setShowNoteInput(true);
    };

    const handleConfirmReview = () => {
        if (!pendingAction) return;

        console.log('handleReview called with action:', pendingAction, 'reportId:', record?.id);
        updateReport(
            {
                resource: 'qna/moderation/reports',
                id: record?.id,
                values: {
                    action: pendingAction,
                    moderatorNote: moderatorNote.trim() || undefined,
                },
            },
            {
                onSuccess: (data) => {
                    console.log('Review success:', data);
                    const actionLabels = {
                        HIDE: 'gizlendi',
                        DELETE: 'silindi',
                        DISMISS: 'reddedildi',
                    };
                    message.success(`Rapor ${actionLabels[pendingAction]}`);
                    setShowNoteInput(false);
                    setModeratorNote('');
                    setPendingAction(null);
                    queryResult.refetch();
                },
                onError: (error: any) => {
                    console.error('Review error:', error);
                    message.error(error?.message || 'İşlem başarısız');
                },
            }
        );
    };

    const handleStatusChange = () => {
        if (!newStatus) return;

        updateReport(
            {
                resource: 'qna/moderation/reports',
                id: record?.id,
                values: {
                    status: newStatus,
                },
            },
            {
                onSuccess: () => {
                    message.success('Rapor durumu güncellendi');
                    setShowStatusModal(false);
                    setNewStatus('');
                    queryResult.refetch();
                },
                onError: (error: any) => {
                    message.error(error?.message || 'Durum güncellenemedi');
                },
            }
        );
    };

    const contentTypeLabels: Record<string, string> = {
        QUESTION: 'Soru',
        ANSWER: 'Cevap',
        COMMENT: 'Yorum',
    };

    const statusLabels: Record<string, string> = {
        PENDING: 'Beklemede',
        REVIEWED: 'İncelendi',
        RESOLVED: 'Çözüldü',
        DISMISSED: 'Reddedildi',
    };

    const statusColors: Record<string, string> = {
        PENDING: 'orange',
        REVIEWED: 'blue',
        RESOLVED: 'green',
        DISMISSED: 'default',
    };

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>Rapor Detayları</Title>

            <Descriptions bordered column={2}>
                <Descriptions.Item label="İçerik Türü">
                    <Tag>{contentTypeLabels[record?.contentType] || record?.contentType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                    <Space>
                        <Tag color={statusColors[record?.status] || 'default'}>
                            {statusLabels[record?.status] || record?.status}
                        </Tag>
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setNewStatus(record?.status || '');
                                setShowStatusModal(true);
                            }}
                        >
                            Değiştir
                        </Button>
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Sebep">
                    <Text strong>{record?.reason}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Raporlayan">
                    {record?.reporter?.email || 'Bilinmiyor'}
                </Descriptions.Item>
                <Descriptions.Item label="Rapor Tarihi">
                    {dayjs(record?.createdAt).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="İnceleyen">
                    {record?.reviewer?.email || 'Henüz incelenmedi'}
                </Descriptions.Item>
                {record?.reviewedAt && (
                    <Descriptions.Item label="İnceleme Tarihi" span={2}>
                        {dayjs(record.reviewedAt).format('DD.MM.YYYY HH:mm')}
                    </Descriptions.Item>
                )}
                {record?.moderatorNote && (
                    <Descriptions.Item label="Moderatör Notu" span={2}>
                        <Text>{record.moderatorNote}</Text>
                    </Descriptions.Item>
                )}
            </Descriptions>

            {record?.description && (
                <Card title="Rapor Açıklaması" style={{ marginTop: 16 }}>
                    <Paragraph>{record.description}</Paragraph>
                </Card>
            )}

            {/* Raporlanan İçerik */}
            <Card
                title={`Raporlanan ${contentTypeLabels[record?.contentType]}`}
                style={{ marginTop: 16 }}
            >
                {loadingContent ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin />
                    </div>
                ) : reportedContent ? (
                    <div>
                        {record?.contentType === 'QUESTION' && (
                            <>
                                <Title level={5}>{reportedContent.title}</Title>
                                <Paragraph>{reportedContent.content}</Paragraph>
                                <div style={{ marginTop: 16 }}>
                                    <Tag>{reportedContent.category}</Tag>
                                    {reportedContent.tags?.map((tag: string) => (
                                        <Tag key={tag} color="blue">{tag}</Tag>
                                    ))}
                                </div>
                            </>
                        )}
                        {record?.contentType === 'ANSWER' && (
                            <Paragraph>{reportedContent.content}</Paragraph>
                        )}
                        {record?.contentType === 'COMMENT' && (
                            <Paragraph>{reportedContent.content}</Paragraph>
                        )}
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                            <Text type="secondary">
                                Yazar: {reportedContent.user?.email || reportedContent.user?.username || 'Bilinmiyor'}
                            </Text>
                            <br />
                            <Text type="secondary">
                                Tarih: {dayjs(reportedContent.createdAt).format('DD.MM.YYYY HH:mm')}
                            </Text>
                        </div>
                    </div>
                ) : (
                    <Alert
                        message="İçerik Bulunamadı"
                        description="Raporlanan içerik silinmiş veya bulunamıyor."
                        type="warning"
                        showIcon
                    />
                )}
            </Card>

            {/* İşlemler */}
            {record?.status === 'PENDING' && (
                <Card title="Moderasyon İşlemleri" style={{ marginTop: 16 }}>
                    <Alert
                        message="Dikkat"
                        description="Bu işlemler geri alınamaz. Lütfen dikkatli olun."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleReview('DELETE')}
                        >
                            İçeriği Sil
                        </Button>
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleReview('HIDE')}
                        >
                            İçeriği Gizle
                        </Button>
                        <Button
                            icon={<CloseOutlined />}
                            onClick={() => handleReview('DISMISS')}
                        >
                            Raporu Reddet
                        </Button>
                    </Space>
                </Card>
            )}

            {record?.status !== 'PENDING' && (
                <Alert
                    message="Bu rapor zaten işleme alınmış"
                    description={`Durum: ${statusLabels[record?.status]}`}
                    type="info"
                    showIcon
                    style={{ marginTop: 16 }}
                />
            )}

            {/* Moderator Note Modal */}
            <Modal
                title="Moderatör Notu"
                open={showNoteInput}
                onOk={handleConfirmReview}
                onCancel={() => {
                    setShowNoteInput(false);
                    setModeratorNote('');
                    setPendingAction(null);
                }}
                okText="Onayla"
                cancelText="İptal"
                width={600}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Alert
                        message="İşlem Notu"
                        description={`Bu rapor için "${pendingAction === 'DELETE' ? 'İçeriği Sil' : pendingAction === 'HIDE' ? 'İçeriği Gizle' : 'Raporu Reddet'}" işlemini gerçekleştirmek üzeresiniz. Lütfen bir açıklama ekleyin.`}
                        type="info"
                        showIcon
                    />
                    <div>
                        <Text strong>Moderatör Notu (İsteğe Bağlı)</Text>
                        <TextArea
                            rows={4}
                            placeholder="Neden bu işlemi yaptığınızı açıklayın..."
                            value={moderatorNote}
                            onChange={(e) => setModeratorNote(e.target.value)}
                            maxLength={500}
                            showCount
                        />
                    </div>
                </Space>
            </Modal>

            {/* Status Change Modal */}
            <Modal
                title="Rapor Durumunu Değiştir"
                open={showStatusModal}
                onOk={handleStatusChange}
                onCancel={() => {
                    setShowStatusModal(false);
                    setNewStatus('');
                }}
                okText="Güncelle"
                cancelText="İptal"
                width={500}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Alert
                        message="Durum Değişikliği"
                        description="Raporun durumunu değiştirerek ilerleme durumunu takip edebilirsiniz."
                        type="info"
                        showIcon
                    />
                    <div>
                        <Text strong>Yeni Durum</Text>
                        <Select
                            style={{ width: '100%', marginTop: 8 }}
                            value={newStatus}
                            onChange={setNewStatus}
                            placeholder="Durum seçin"
                            options={[
                                { value: 'PENDING', label: '🟡 Beklemede' },
                                { value: 'REVIEWED', label: '🔵 İnceleniyor' },
                                { value: 'RESOLVED', label: '🟢 Çözüldü' },
                                { value: 'DISMISSED', label: '⚪ Reddedildi' },
                            ]}
                        />
                    </div>
                </Space>
            </Modal>
        </Show>
    );
}
