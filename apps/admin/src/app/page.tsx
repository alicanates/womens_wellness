'use client';

import { Card, Col, Row, Statistic, Table } from 'antd';
import { UserOutlined, CrownOutlined, QuestionCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalQuestions: 0,
    totalArticles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats from various endpoints
      const [usersRes, subsRes, questionsRes, articlesRes] = await Promise.allSettled([
        axios.get(`${API_URL}/users`, { headers, params: { limit: 1 } }),
        axios.get(`${API_URL}/subscription/admin/all`, { headers, params: { limit: 1 } }),
        axios.get(`${API_URL}/qna/questions`, { headers, params: { limit: 1 } }),
        axios.get(`${API_URL}/discover/articles`, { headers, params: { limit: 1 } }),
      ]);

      setStats({
        totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.data.total || 0 : 0,
        activeSubscriptions: subsRes.status === 'fulfilled' ? subsRes.value.data.total || 0 : 0,
        totalQuestions: questionsRes.status === 'fulfilled' ? questionsRes.value.data.total || 0 : 0,
        totalArticles: articlesRes.status === 'fulfilled' ? articlesRes.value.data.total || 0 : 0,
      });
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Wellness Yönetim Paneli</h1>
      <p style={{ marginBottom: 24 }}>Wellness uygulamanızı buradan yönetin</p>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Kullanıcı"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Aktif Abonelik"
              value={stats.activeSubscriptions}
              prefix={<CrownOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Soru"
              value={stats.totalQuestions}
              prefix={<QuestionCircleOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Makale"
              value={stats.totalArticles}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Hızlı Erişim">
            <ul>
              <li><a href="/users">Kullanıcıları Yönet</a></li>
              <li><a href="/subscriptions">Abonelikleri Görüntüle</a></li>
              <li><a href="/qna/questions">Soru & Cevap Moderasyonu</a></li>
              <li><a href="/content/articles">Makaleleri Yönet</a></li>
              <li><a href="/ai/model-policies">AI Modellerini Yapılandır</a></li>
              <li><a href="/system/feature-flags">Özellik Bayraklarını Yönet</a></li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
