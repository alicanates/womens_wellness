'use client';

import { Card, Tabs, Table, Statistic, Row, Col } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function WellnessData() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalSteps: 0,
        totalMeditation: 0,
        totalSleep: 0,
        totalWater: 0,
    });

    useEffect(() => {
        fetchWellnessStats();
    }, []);

    const fetchWellnessStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch aggregated stats
            const response = await axios.get(`${API_URL}/wellness/v1/admin/stats`, { headers });
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch wellness stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h1>Wellness Data Overview</h1>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Steps Logged"
                            value={stats.totalSteps}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Meditation (min)"
                            value={stats.totalMeditation}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Sleep (hours)"
                            value={stats.totalSleep}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Water (ml)"
                            value={stats.totalWater}
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <p>Detailed wellness tracking data can be viewed per user in the Users section.</p>
            </Card>
        </div>
    );
}
