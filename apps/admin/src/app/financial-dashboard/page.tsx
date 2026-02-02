'use client';

import { Card, Col, Row, Statistic, Select, Spin, Tag, Progress, Space } from 'antd';
import {
    DollarOutlined,
    RiseOutlined,
    FallOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    TrophyOutlined,
    LineChartOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Column, Pie } from '@ant-design/charts';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function FinancialDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [mrr, setMrr] = useState<any>(null);
    const [churnRate, setChurnRate] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [revenueOverTime, setRevenueOverTime] = useState<any[]>([]);
    const [paymentProviders, setPaymentProviders] = useState<any[]>([]);
    const [tierBreakdown, setTierBreakdown] = useState<any[]>([]);
    const [forecast, setForecast] = useState<any>(null);

    useEffect(() => {
        fetchFinancialData();
    }, [days]);

    const fetchFinancialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };

            const [
                mrrRes,
                churnRes,
                metricsRes,
                revenueRes,
                providersRes,
                tierRes,
                forecastRes,
            ] = await Promise.allSettled([
                axios.get(`${API_URL}/subscription/financial-analytics/mrr`, { headers }),
                axios.get(`${API_URL}/subscription/financial-analytics/churn-rate`, { headers, params: { days } }),
                axios.get(`${API_URL}/subscription/financial-analytics/metrics`, { headers, params: { days } }),
                axios.get(`${API_URL}/subscription/financial-analytics/revenue-over-time`, { headers, params: { days } }),
                axios.get(`${API_URL}/subscription/financial-analytics/payment-providers`, { headers, params: { days } }),
                axios.get(`${API_URL}/subscription/financial-analytics/tier-breakdown`, { headers }),
                axios.get(`${API_URL}/subscription/financial-analytics/forecast`, { headers }),
            ]);

            if (mrrRes.status === 'fulfilled') setMrr(mrrRes.value.data);
            if (churnRes.status === 'fulfilled') setChurnRate(churnRes.value.data);
            if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value.data);
            if (revenueRes.status === 'fulfilled') setRevenueOverTime(revenueRes.value.data);
            if (providersRes.status === 'fulfilled') setPaymentProviders(providersRes.value.data);
            if (tierRes.status === 'fulfilled') setTierBreakdown(tierRes.value.data);
            if (forecastRes.status === 'fulfilled') setForecast(forecastRes.value.data);
        } catch (error) {
            console.error('Finansal veriler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const revenueConfig = {
        data: revenueOverTime,
        xField: 'date',
        yField: 'revenue',
        smooth: true,
        color: '#52c41a',
        point: {
            size: 3,
            shape: 'circle',
        },
        yAxis: {
            label: {
                formatter: (v: string) => `₺${v}`,
            },
        },
    };

    const providerConfig = {
        data: paymentProviders,
        angleField: 'revenue',
        colorField: 'provider',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} ₺{value}',
        },
    };

    const tierConfig = {
        data: tierBreakdown,
        xField: 'tier',
        yField: 'count',
        seriesField: 'status',
        isGroup: true,
        columnStyle: {
            radius: [8, 8, 0, 0],
        },
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
                        💰 Finansal Dashboard
                    </h1>
                    <p style={{ color: '#8c8c8c', fontSize: 14 }}>
                        Gelir, abonelik ve finansal metrikler
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

            {/* MRR & Key Metrics */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Aylık Yinelenen Gelir (MRR)"
                            value={mrr?.currentMRR || 0}
                            prefix="₺"
                            valueStyle={{ color: '#52c41a', fontSize: 24 }}
                            suffix={
                                mrr?.growthPercentage > 0 ? (
                                    <Tag color="green" icon={<RiseOutlined />}>
                                        +{mrr.growthPercentage}%
                                    </Tag>
                                ) : mrr?.growthPercentage < 0 ? (
                                    <Tag color="red" icon={<FallOutlined />}>
                                        {mrr.growthPercentage}%
                                    </Tag>
                                ) : null
                            }
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                            Önceki ay: ₺{mrr?.previousMRR || 0}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Toplam Gelir"
                            value={metrics?.totalRevenue || 0}
                            prefix="₺"
                            valueStyle={{ color: '#1890ff', fontSize: 24 }}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                            {metrics?.totalTransactions || 0} işlem
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Churn Oranı"
                            value={churnRate?.churnRate || 0}
                            suffix="%"
                            valueStyle={{
                                color: (churnRate?.churnRate || 0) > 5 ? '#f5222d' : '#52c41a',
                                fontSize: 24,
                            }}
                            prefix={
                                (churnRate?.churnRate || 0) > 5 ? (
                                    <FallOutlined style={{ color: '#f5222d' }} />
                                ) : (
                                    <RiseOutlined style={{ color: '#52c41a' }} />
                                )
                            }
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                            {churnRate?.cancelledSubscriptions || 0} iptal
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Ort. Kullanıcı Geliri"
                            value={metrics?.avgRevenuePerUser || 0}
                            prefix="₺"
                            valueStyle={{ color: '#722ed1', fontSize: 24 }}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                            ARPU (Average Revenue Per User)
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Subscription Metrics */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Aktif Abonelik"
                            value={metrics?.activeSubscriptions || 0}
                            prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Yeni Abonelik"
                            value={metrics?.newSubscriptions || 0}
                            prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Deneme Aboneliği"
                            value={metrics?.trialSubscriptions || 0}
                            prefix={<ThunderboltOutlined style={{ color: '#13c2c2' }} />}
                            valueStyle={{ color: '#13c2c2' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Dönüşüm Oranı"
                            value={metrics?.conversionRate || 0}
                            suffix="%"
                            prefix={<ShoppingCartOutlined style={{ color: '#722ed1' }} />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Revenue Forecast */}
            {forecast && (
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col span={24}>
                        <Card
                            title={
                                <Space>
                                    <LineChartOutlined />
                                    <span>Gelir Tahmini (Gelecek Ay)</span>
                                    <Tag color="orange">Düşük Güven</Tag>
                                </Space>
                            }
                            bordered={false}
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={6}>
                                    <Statistic
                                        title="Mevcut MRR"
                                        value={forecast.currentMRR}
                                        prefix="₺"
                                        valueStyle={{ fontSize: 20 }}
                                    />
                                </Col>
                                <Col xs={24} md={6}>
                                    <Statistic
                                        title="Tahmini MRR"
                                        value={forecast.forecastedMRR}
                                        prefix="₺"
                                        valueStyle={{ fontSize: 20, color: '#1890ff' }}
                                    />
                                </Col>
                                <Col xs={24} md={6}>
                                    <Statistic
                                        title="Beklenen Kayıp"
                                        value={forecast.expectedChurnLoss}
                                        prefix="₺"
                                        valueStyle={{ fontSize: 20, color: '#f5222d' }}
                                    />
                                </Col>
                                <Col xs={24} md={6}>
                                    <Statistic
                                        title="Beklenen Büyüme"
                                        value={forecast.expectedGrowth}
                                        prefix="₺"
                                        valueStyle={{ fontSize: 20, color: '#52c41a' }}
                                    />
                                </Col>
                            </Row>
                            <div style={{ marginTop: 16 }}>
                                <Progress
                                    percent={
                                        forecast.currentMRR > 0
                                            ? Math.round((forecast.forecastedMRR / forecast.currentMRR) * 100)
                                            : 0
                                    }
                                    strokeColor={{
                                        '0%': '#108ee9',
                                        '100%': '#87d068',
                                    }}
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="📈 Gelir Trendi" bordered={false}>
                        {revenueOverTime.length > 0 ? (
                            <Line {...revenueConfig} height={300} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                                Veri bulunamadı
                            </div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="💳 Ödeme Sağlayıcıları" bordered={false}>
                        {paymentProviders.length > 0 ? (
                            <Pie {...providerConfig} height={300} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                                Veri bulunamadı
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Tier Breakdown */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="📊 Abonelik Tier Dağılımı" bordered={false}>
                        {tierBreakdown.length > 0 ? (
                            <Column {...tierConfig} height={300} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                                Veri bulunamadı
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
