'use client';

import { Card, Col, Row, Statistic, Progress, Timeline, Tag, Space, Divider, Avatar, List, Badge } from 'antd';
import {
  UserOutlined,
  CrownOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  MessageOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalQuestions: 0,
    totalArticles: 0,
    pendingReports: 0,
    totalAnswers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data
      const [usersRes, subsRes, questionsRes, articlesRes, reportsRes, answersRes] = await Promise.allSettled([
        axios.get(`${API_URL}/users`, { headers, params: { limit: 1 } }),
        axios.get(`${API_URL}/subscription/admin/all`, { headers, params: { limit: 1 } }),
        axios.get(`${API_URL}/qna/questions`, { headers, params: { limit: 5 } }),
        axios.get(`${API_URL}/discover/articles`, { headers, params: { limit: 1 } }),
        axios.get(`${API_URL}/qna/moderation/reports`, { headers, params: { status: 'PENDING', limit: 5 } }),
        axios.get(`${API_URL}/qna/answers`, { headers, params: { limit: 1 } }),
      ]);

      const users = usersRes.status === 'fulfilled' ? usersRes.value.data.total || 0 : 0;
      const subs = subsRes.status === 'fulfilled' ? subsRes.value.data.total || 0 : 0;
      const questions = questionsRes.status === 'fulfilled' ? questionsRes.value.data.total || 0 : 0;
      const articles = articlesRes.status === 'fulfilled' ? articlesRes.value.data.total || 0 : 0;
      const reports = reportsRes.status === 'fulfilled' ? reportsRes.value.data.pagination?.total || 0 : 0;
      const answers = answersRes.status === 'fulfilled' ? answersRes.value.data.length || 0 : 0;

      setStats({
        totalUsers: users,
        activeSubscriptions: subs,
        totalQuestions: questions,
        totalArticles: articles,
        pendingReports: reports,
        totalAnswers: answers,
      });

      // Recent questions as activity
      if (questionsRes.status === 'fulfilled') {
        const recentQuestions = questionsRes.value.data.questions || [];
        setRecentActivity(recentQuestions.slice(0, 5));
      }

      // Pending reports
      if (reportsRes.status === 'fulfilled') {
        const reports = reportsRes.value.data.reports || [];
        setPendingReports(reports.slice(0, 5));
      }
    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { title: 'Kullanıcılar', path: '/users', icon: <UserOutlined />, color: '#1890ff' },
    { title: 'AI Analizi', path: '/ai-analytics', icon: <RiseOutlined />, color: '#13c2c2' },
    { title: 'Abonelikler', path: '/subscriptions', icon: <CrownOutlined />, color: '#faad14' },
    { title: 'Sorular', path: '/qna/questions', icon: <QuestionCircleOutlined />, color: '#52c41a' },
    { title: 'Cevaplar', path: '/qna/answers', icon: <MessageOutlined />, color: '#13c2c2' },
    { title: 'Raporlar', path: '/qna/reports', icon: <WarningOutlined />, color: '#f5222d' },
    { title: 'Makaleler', path: '/content/articles', icon: <FileTextOutlined />, color: '#722ed1' },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Wellness Yönetim Paneli
        </h1>
        <p style={{ color: '#8c8c8c', fontSize: 14 }}>
          Hoş geldiniz! Sistemin genel durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      {/* Main Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={<span style={{ fontSize: 14, color: '#8c8c8c' }}>Toplam Kullanıcı</span>}
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              loading={loading}
              valueStyle={{ color: '#1890ff', fontSize: 28, fontWeight: 600 }}
            />
            <div style={{ marginTop: 12, fontSize: 12, color: '#52c41a' }}>
              <RiseOutlined /> Aktif kullanıcı tabanı
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={<span style={{ fontSize: 14, color: '#8c8c8c' }}>Aktif Abonelik</span>}
              value={stats.activeSubscriptions}
              prefix={<CrownOutlined style={{ color: '#faad14' }} />}
              loading={loading}
              valueStyle={{ color: '#faad14', fontSize: 28, fontWeight: 600 }}
            />
            <div style={{ marginTop: 12, fontSize: 12 }}>
              <Progress
                percent={stats.totalUsers > 0 ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}
                size="small"
                showInfo={false}
                strokeColor="#faad14"
              />
              <span style={{ color: '#8c8c8c' }}>
                {stats.totalUsers > 0 ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}% dönüşüm oranı
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={<span style={{ fontSize: 14, color: '#8c8c8c' }}>Topluluk Soruları</span>}
              value={stats.totalQuestions}
              prefix={<QuestionCircleOutlined style={{ color: '#52c41a' }} />}
              loading={loading}
              valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 600 }}
            />
            <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c' }}>
              <MessageOutlined /> {stats.totalAnswers} cevap
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Badge count={stats.pendingReports} offset={[-10, 10]}>
              <Statistic
                title={<span style={{ fontSize: 14, color: '#8c8c8c' }}>Bekleyen Rapor</span>}
                value={stats.pendingReports}
                prefix={<WarningOutlined style={{ color: '#f5222d' }} />}
                loading={loading}
                valueStyle={{ color: '#f5222d', fontSize: 28, fontWeight: 600 }}
              />
            </Badge>
            {stats.pendingReports > 0 && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#f5222d' }}>
                <ClockCircleOutlined /> İnceleme bekliyor
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Links */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={<span style={{ fontSize: 16, fontWeight: 600 }}>Hızlı Erişim</span>}
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <Row gutter={[16, 16]}>
              {quickLinks.map((link) => (
                <Col xs={12} sm={8} md={6} lg={4} key={link.path}>
                  <Card
                    hoverable
                    onClick={() => router.push(link.path)}
                    style={{
                      textAlign: 'center',
                      borderRadius: 8,
                      border: `1px solid ${link.color}20`,
                    }}
                    bodyStyle={{ padding: 16 }}
                  >
                    <div style={{ fontSize: 32, color: link.color, marginBottom: 8 }}>
                      {link.icon}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{link.title}</div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity & Pending Reports */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Son Aktiviteler</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 8, height: '100%' }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>Yükleniyor...</div>
            ) : recentActivity.length > 0 ? (
              <List
                dataSource={recentActivity}
                renderItem={(item: any) => (
                  <List.Item
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/qna/questions`)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ backgroundColor: '#1890ff' }}
                          icon={<QuestionCircleOutlined />}
                        />
                      }
                      title={
                        <Space>
                          <span>{item.title}</span>
                          {item.isPremium && <Tag color="gold">Premium</Tag>}
                        </Space>
                      }
                      description={
                        <Space split={<Divider type="vertical" />}>
                          <span>{item.user?.username || 'Anonim'}</span>
                          <span>{dayjs(item.createdAt).fromNow()}</span>
                          <span>{item._count?.answers || 0} cevap</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                Henüz aktivite yok
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#f5222d' }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Bekleyen Raporlar</span>
                {stats.pendingReports > 0 && (
                  <Badge count={stats.pendingReports} style={{ backgroundColor: '#f5222d' }} />
                )}
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 8, height: '100%' }}
            extra={
              stats.pendingReports > 0 && (
                <a onClick={() => router.push('/qna/reports')}>Tümünü Gör</a>
              )
            }
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>Yükleniyor...</div>
            ) : pendingReports.length > 0 ? (
              <List
                dataSource={pendingReports}
                renderItem={(item: any) => (
                  <List.Item
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/qna/reports/show/${item.id}`)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ backgroundColor: '#f5222d' }}
                          icon={<WarningOutlined />}
                        />
                      }
                      title={
                        <Space>
                          <span>{item.reason}</span>
                          <Tag color="orange">Beklemede</Tag>
                        </Space>
                      }
                      description={
                        <Space split={<Divider type="vertical" />}>
                          <span>
                            {item.contentType === 'QUESTION'
                              ? 'Soru'
                              : item.contentType === 'ANSWER'
                                ? 'Cevap'
                                : 'Yorum'}
                          </span>
                          <span>{dayjs(item.createdAt).fromNow()}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#52c41a' }}>
                <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>Bekleyen rapor yok</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* System Status */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={<span style={{ fontSize: 16, fontWeight: 600 }}>Sistem Durumu</span>}
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card bordered style={{ borderRadius: 8 }}>
                  <Statistic
                    title="İçerik Moderasyonu"
                    value={stats.pendingReports === 0 ? 'Temiz' : 'Dikkat'}
                    valueStyle={{
                      color: stats.pendingReports === 0 ? '#52c41a' : '#faad14',
                    }}
                    prefix={
                      stats.pendingReports === 0 ? (
                        <CheckCircleOutlined />
                      ) : (
                        <WarningOutlined />
                      )
                    }
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered style={{ borderRadius: 8 }}>
                  <Statistic
                    title="Topluluk Aktivitesi"
                    value={stats.totalQuestions > 0 ? 'Aktif' : 'Düşük'}
                    valueStyle={{
                      color: stats.totalQuestions > 0 ? '#52c41a' : '#8c8c8c',
                    }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered style={{ borderRadius: 8 }}>
                  <Statistic
                    title="Kullanıcı Memnuniyeti"
                    value="Yüksek"
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<HeartOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
