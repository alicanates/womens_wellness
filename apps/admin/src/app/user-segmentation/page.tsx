'use client';

import { Card, Col, Row, Statistic, Table, Tag, Button, Select, Checkbox, DatePicker, Space, message } from 'antd';
import {
    UserOutlined,
    CrownOutlined,
    FireOutlined,
    ClockCircleOutlined,
    HeartOutlined,
    CalendarOutlined,
    FilterOutlined,
    MailOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const { RangePicker } = DatePicker;

export default function UserSegmentationPage() {
    const [loading, setLoading] = useState(true);
    const [predefinedStats, setPredefinedStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // Filters
    const [subscriptionStatus, setSubscriptionStatus] = useState<string[]>([]);
    const [isPregnant, setIsPregnant] = useState<boolean | undefined>(undefined);
    const [hasActiveCycle, setHasActiveCycle] = useState<boolean | undefined>(undefined);
    const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    useEffect(() => {
        fetchPredefinedStats();
    }, []);

    const fetchPredefinedStats = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };

            const res = await axios.get(`${API_URL}/users/segmentation/predefined`, { headers });
            setPredefinedStats(res.data);
        } catch (error) {
            console.error('Stats yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };

            const filters: any = {};

            if (subscriptionStatus.length > 0) {
                filters.subscriptionStatus = subscriptionStatus;
            }

            if (isPregnant !== undefined) {
                filters.isPregnant = isPregnant;
            }

            if (hasActiveCycle !== undefined) {
                filters.hasActiveCycle = hasActiveCycle;
            }

            if (isActive !== undefined) {
                filters.isActive = isActive;
            }

            if (dateRange) {
                filters.createdAfter = dateRange[0].toISOString();
                filters.createdBefore = dateRange[1].toISOString();
            }

            const res = await axios.post(
                `${API_URL}/users/segmentation/query`,
                { filters, limit: 100, offset: 0 },
                { headers },
            );

            setUsers(res.data.users);
            setTotalUsers(res.data.stats.totalUsers);
            message.success(`${res.data.stats.totalUsers} kullanıcı bulundu`);
        } catch (error) {
            console.error('Filtreleme hatası:', error);
            message.error('Filtreleme başarısız');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSubscriptionStatus([]);
        setIsPregnant(undefined);
        setHasActiveCycle(undefined);
        setIsActive(undefined);
        setDateRange(null);
        setUsers([]);
        setTotalUsers(0);
    };

    const sendBulkEmail = () => {
        if (selectedUsers.length === 0) {
            message.warning('Lütfen kullanıcı seçin');
            return;
        }
        message.info(`${selectedUsers.length} kullanıcıya email gönderme özelliği yakında eklenecek`);
    };

    const sendBulkNotification = () => {
        if (selectedUsers.length === 0) {
            message.warning('Lütfen kullanıcı seçin');
            return;
        }
        message.info(`${selectedUsers.length} kullanıcıya bildirim gönderme özelliği yakında eklenecek`);
    };

    const columns = [
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Kullanıcı Adı',
            dataIndex: 'username',
            key: 'username',
            render: (username: string) => username || '-',
        },
        {
            title: 'İsim',
            dataIndex: 'displayName',
            key: 'displayName',
        },
        {
            title: 'Abonelik',
            dataIndex: 'subscriptionStatus',
            key: 'subscriptionStatus',
            render: (status: string) => {
                const colors: any = {
                    ACTIVE: 'gold',
                    FREE: 'default',
                    TRIAL: 'blue',
                    EXPIRED: 'red',
                };
                return <Tag color={colors[status] || 'default'}>{status}</Tag>;
            },
        },
        {
            title: 'Kayıt Tarihi',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Son Aktivite',
            dataIndex: 'lastActive',
            key: 'lastActive',
            render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'),
        },
    ];

    const rowSelection = {
        selectedRowKeys: selectedUsers,
        onChange: (selectedRowKeys: any) => {
            setSelectedUsers(selectedRowKeys);
        },
    };

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                    👥 Kullanıcı Segmentasyonu
                </h1>
                <p style={{ color: '#8c8c8c', fontSize: 14 }}>
                    Kullanıcıları filtrele, segmentlere ayır ve toplu işlemler yap
                </p>
            </div>

            {/* Predefined Segments */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Toplam Kullanıcı"
                            value={predefinedStats?.totalUsers || 0}
                            prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Premium Kullanıcı"
                            value={predefinedStats?.premiumUsers || 0}
                            prefix={<CrownOutlined style={{ color: '#faad14' }} />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Aktif Kullanıcı (7 gün)"
                            value={predefinedStats?.activeUsers || 0}
                            prefix={<FireOutlined style={{ color: '#52c41a' }} />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Yeni Kullanıcı (7 gün)"
                            value={predefinedStats?.newUsers || 0}
                            prefix={<ClockCircleOutlined style={{ color: '#13c2c2' }} />}
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Hamile Kullanıcı"
                            value={predefinedStats?.pregnantUsers || 0}
                            prefix={<HeartOutlined style={{ color: '#ff4d4f' }} />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Adet Takibi Yapan"
                            value={predefinedStats?.cycleTrackingUsers || 0}
                            prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Ücretsiz Kullanıcı"
                            value={predefinedStats?.freeUsers || 0}
                            prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Pasif Kullanıcı (30 gün)"
                            value={predefinedStats?.inactiveUsers || 0}
                            prefix={<ClockCircleOutlined style={{ color: '#f5222d' }} />}
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card title={<span><FilterOutlined /> Özel Segment Oluştur</span>} style={{ marginTop: 24 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12} lg={6}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Abonelik Durumu</div>
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Seçiniz"
                            value={subscriptionStatus}
                            onChange={setSubscriptionStatus}
                            options={[
                                { label: 'Ücretsiz', value: 'FREE' },
                                { label: 'Aktif', value: 'ACTIVE' },
                                { label: 'Deneme', value: 'TRIAL' },
                                { label: 'Süresi Dolmuş', value: 'EXPIRED' },
                            ]}
                        />
                    </Col>
                    <Col xs={24} md={12} lg={6}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Aktivite Durumu</div>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Seçiniz"
                            value={isActive}
                            onChange={setIsActive}
                            allowClear
                            options={[
                                { label: 'Aktif (Son 7 gün)', value: true },
                                { label: 'Pasif', value: false },
                            ]}
                        />
                    </Col>
                    <Col xs={24} md={12} lg={6}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Kayıt Tarihi</div>
                        <RangePicker
                            style={{ width: '100%' }}
                            value={dateRange}
                            onChange={(dates: any) => setDateRange(dates)}
                        />
                    </Col>
                    <Col xs={24} md={12} lg={6}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Özel Filtreler</div>
                        <Space direction="vertical">
                            <Checkbox
                                checked={isPregnant === true}
                                onChange={(e) => setIsPregnant(e.target.checked ? true : undefined)}
                            >
                                Hamile Kullanıcılar
                            </Checkbox>
                            <Checkbox
                                checked={hasActiveCycle === true}
                                onChange={(e) => setHasActiveCycle(e.target.checked ? true : undefined)}
                            >
                                Aktif Adet Döngüsü
                            </Checkbox>
                        </Space>
                    </Col>
                </Row>
                <Row style={{ marginTop: 16 }}>
                    <Col span={24}>
                        <Space>
                            <Button type="primary" icon={<FilterOutlined />} onClick={applyFilters} loading={loading}>
                                Filtrele
                            </Button>
                            <Button onClick={clearFilters}>Temizle</Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Results */}
            {users.length > 0 && (
                <Card
                    title={`Sonuçlar (${totalUsers} kullanıcı)`}
                    style={{ marginTop: 24 }}
                    extra={
                        <Space>
                            <Button
                                icon={<MailOutlined />}
                                onClick={sendBulkEmail}
                                disabled={selectedUsers.length === 0}
                            >
                                Toplu Email ({selectedUsers.length})
                            </Button>
                            <Button
                                icon={<BellOutlined />}
                                onClick={sendBulkNotification}
                                disabled={selectedUsers.length === 0}
                            >
                                Toplu Bildirim ({selectedUsers.length})
                            </Button>
                        </Space>
                    }
                >
                    <Table
                        rowSelection={rowSelection}
                        dataSource={users}
                        columns={columns}
                        rowKey="id"
                        pagination={{ pageSize: 20 }}
                        loading={loading}
                    />
                </Card>
            )}
        </div>
    );
}
