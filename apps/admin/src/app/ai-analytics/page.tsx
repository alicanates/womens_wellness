'use client';

import { Card, Col, Row, Statistic, Table, Tag, Select, Spin, Empty } from 'antd';
import {
    MessageOutlined,
    RiseOutlined,
    UserOutlined,
    FireOutlined,
    LineChartOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Pie } from '@ant-design/charts';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function AIAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [stats, setStats] = useState<any>(null);
    const [topQuestions, setTopQuestions] = useState<any[]>([]);
    const [popularTopics, setPopularTopics] = useState<any[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [engagement, setEngagement] = useState<any>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [days]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, questionsRes, topicsRes, trendsRes, engagementRes] = await Promise.allSettled([
                axios.get(`${API_URL}/chat/analytics/stats`, { headers, params: { days } }),
                axios.get(`${API_URL}/chat/analytics/top-questions`, { headers, params: { days, limit: 10 } }),
                axios.get(`${API_URL}/chat/analytics/popular-topics`, { headers, params: { days } }),
                axios.get(`${API_URL}/chat/analytics/trends`, { headers, params: { days } }),
                axios.get(`${API_URL}/chat/analytics/engagement`, { headers, params: { days } }),
            ]);

            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
            if (questionsRes.status === 'fulfilled') setTopQuestions(questionsRes.value.data);
            if (topicsRes.status === 'fulfilled') setPopularTopics(topicsRes.value.data);
            if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value.data);
            if (engagementRes.status === 'fulfilled') setEngagement(engagementRes.value.data);
        } catch (error) {
            console.error('Analytics yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const questionColumns = [
        {
            title: 'Soru',
            dataIndex: 'question',
            key: 'question',
            ellipsis: true,
        },
        {
            title: 'Sıklık',
            dataIndex: 'count',
            key: 'count',
            width: 100,
            render: (count: number) => <Tag color="blue">{count}x</Tag>,
        },
    ];

    const trendConfig = {
        data: trends,
        xField: 'date',
        yField: 'count',
        smooth: true,
        color: '#1890ff',
        point: {
            size: 3,
            shape: 'circle',
        },
        label: {
            style: {
                fill: '#aaa',
            },
        },
    };

    const topicConfig = {
        data: popularTopics,
        angleField: 'count',
        colorField: 'topic',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
        interactions: [
            {
                type: 'element-active',
            },
        ],
    };

    if (loading) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                        🤖 AI Chat Analizi
                    </h1>
                    <p style={{ color: '#8c8c8c', fontSize: 14 }}>
                        Kullanıcı sohbetleri ve AI performans metrikleri
                    </p>
                </div>
                <Select
                    value={days}
                    onChange={setDays}
                    style={{ width: 150 }}
                    options={[
                        { label: 'Son 7 Gün', value: 7 },
                        { label: 'Son 30 Gün', value: 30 },
                        { label: 'Son 90 Gün', value: 90 },
                    ]}
                />
            </div>

            {/* Main Stats */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Toplam Sohbet"
                            value={stats?.totalConversations || 0}
                            prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Toplam Mesaj"
                            value={stats?.totalMessages || 0}
                            prefix={<MessageOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Yanıt Oranı"
                            value={stats?.responseRate || 0}
                            suffix="%"
                            prefix={<RiseOutlined style={{ color: '#faad14' }} />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Ort. Mesaj/Sohbet"
                            value={stats?.avgMessagesPerConversation || 0}
                            prefix={<LineChartOutlined style={{ color: '#722ed1' }} />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Engagement Stats */}
            {engagement && (
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false}>
                            <Statistic
                                title="Aktif Kullanıcı"
                                value={engagement.activeUsers}
                                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false}>
                            <Statistic
                                title="Geri Dönen Kullanıcı"
                                value={engagement.returningUsers}
                                prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false}>
                            <Statistic
                                title="Yeni Kullanıcı"
                                value={engagement.newUsers}
                                prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false}>
                            <Statistic
                                title="Retention Oranı"
                                value={engagement.retentionRate}
                                suffix="%"
                                prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="📈 Sohbet Trendleri" bordered={false}>
                        {trends.length > 0 ? (
                            <Line {...trendConfig} height={300} />
                        ) : (
                            <Empty description="Veri bulunamadı" />
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="🎯 Popüler Konular" bordered={false}>
                        {popularTopics.length > 0 ? (
                            <Pie {...topicConfig} height={300} />
                        ) : (
                            <Empty description="Veri bulunamadı" />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Top Questions */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card
                        title={
                            <span>
                                <QuestionCircleOutlined /> En Çok Sorulan Sorular
                            </span>
                        }
                        bordered={false}
                    >
                        {topQuestions.length > 0 ? (
                            <Table
                                dataSource={topQuestions}
                                columns={questionColumns}
                                pagination={false}
                                rowKey="question"
                            />
                        ) : (
                            <Empty description="Veri bulunamadı" />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
