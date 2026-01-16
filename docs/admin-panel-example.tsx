/**
 * Admin Panel Dashboard Example (React/Next.js)
 * 
 * Bu dosya admin panel için örnek bir React component'idir.
 * Gerçek implementasyonda kullanılabilir veya referans olarak kullanılabilir.
 */

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface DashboardStats {
    users: {
        total: number;
        active: number;
        new: number;
        growth: number;
    };
    subscriptions: {
        total: number;
        active: number;
        revenue: number;
        growth: number;
    };
    engagement: {
        dailyActive: number;
        weeklyActive: number;
        monthlyActive: number;
        avgSessionTime: number;
    };
    content: {
        questions: number;
        answers: number;
        articles: number;
        conversations: number;
    };
}

interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
    }>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [userGrowthChart, setUserGrowthChart] = useState<ChartData | null>(null);
    const [revenueChart, setRevenueChart] = useState<ChartData | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [alerts, setAlerts] = useState<Array<any>>([]);

    // Initialize WebSocket connection
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        const newSocket = io('http://localhost:4000/admin', {
            auth: { token },
        });

        newSocket.on('connect', () => {
            console.log('Connected to admin WebSocket');
            setIsConnected(true);

            // Subscribe to updates
            newSocket.emit('subscribe:dashboard');
            newSocket.emit('subscribe:system-metrics');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from admin WebSocket');
            setIsConnected(false);
        });

        // Listen for dashboard updates
        newSocket.on('dashboard:update', (data: DashboardStats) => {
            console.log('Dashboard updated:', data);
            setStats(data);
        });

        // Listen for system alerts
        newSocket.on('system:alert', (alert: any) => {
            console.log('System alert:', alert);
            setAlerts(prev => [alert, ...prev].slice(0, 10));
        });

        // Listen for new users
        newSocket.on('user:new', (user: any) => {
            console.log('New user registered:', user);
            // Show notification
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    // Fetch initial data
    useEffect(() => {
        fetchDashboardData();
        fetchChartData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:4000/admin/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const fetchChartData = async () => {
        try {
            const token = localStorage.getItem('adminToken');

            const [userGrowth, revenue] = await Promise.all([
                fetch('http://localhost:4000/admin/charts/user-growth?days=30', {
                    headers: { 'Authorization': `Bearer ${token}` },
                }).then(r => r.json()),
                fetch('http://localhost:4000/admin/charts/revenue?days=30', {
                    headers: { 'Authorization': `Bearer ${token}` },
                }).then(r => r.json()),
            ]);

            setUserGrowthChart(userGrowth);
            setRevenueChart(revenue);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    if (!stats) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <div className="flex items-center gap-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-gray-600">
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Users Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
                            <p className="text-sm text-green-600 mt-1">
                                +{stats.users.growth.toFixed(1)}% growth
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        <span className="font-semibold">{stats.users.active}</span> active users
                    </div>
                </div>

                {/* Subscriptions Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Subscriptions</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.subscriptions.active}</p>
                            <p className="text-sm text-green-600 mt-1">
                                ${stats.subscriptions.revenue.toFixed(2)} revenue
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Engagement Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Daily Active Users</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.engagement.dailyActive}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                {stats.engagement.weeklyActive} weekly
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Questions</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.content.questions}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                {stats.content.answers} answers
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* User Growth Chart */}
                {userGrowthChart && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">User Growth</h2>
                        <Line
                            data={userGrowthChart}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top' as const,
                                    },
                                    title: {
                                        display: false,
                                    },
                                },
                            }}
                        />
                    </div>
                )}

                {/* Revenue Chart */}
                {revenueChart && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue</h2>
                        <Bar
                            data={revenueChart}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top' as const,
                                    },
                                    title: {
                                        display: false,
                                    },
                                },
                            }}
                        />
                    </div>
                )}
            </div>

            {/* System Alerts */}
            {alerts.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">System Alerts</h2>
                    <div className="space-y-2">
                        {alerts.map((alert, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg ${alert.level === 'error' ? 'bg-red-50 text-red-800' :
                                        alert.level === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                                            'bg-blue-50 text-blue-800'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{alert.message}</span>
                                    <span className="text-sm">
                                        {new Date(alert.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * User Search Component Example
 */
export function UserSearchPanel() {
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        hasSubscription: undefined as boolean | undefined,
        page: 1,
        limit: 20,
    });
    const [users, setUsers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const searchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const params = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, value.toString());
                }
            });

            const response = await fetch(
                `http://localhost:4000/admin/users/search?${params.toString()}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );

            const data = await response.json();
            setUsers(data.data);
            setTotal(data.total);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        searchUsers();
    }, [filters.page]);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Search by email, username, or name..."
                        className="px-4 py-2 border rounded-lg"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />

                    <select
                        className="px-4 py-2 border rounded-lg"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="banned">Banned</option>
                    </select>

                    <select
                        className="px-4 py-2 border rounded-lg"
                        value={filters.hasSubscription?.toString() || ''}
                        onChange={(e) => setFilters({
                            ...filters,
                            hasSubscription: e.target.value === '' ? undefined : e.target.value === 'true'
                        })}
                    >
                        <option value="">All Users</option>
                        <option value="true">With Subscription</option>
                        <option value="false">Without Subscription</option>
                    </select>
                </div>

                <button
                    onClick={searchUsers}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Found {total} users
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Email</th>
                                    <th className="text-left py-3 px-4">Username</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-left py-3 px-4">Subscription</th>
                                    <th className="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">{user.email}</td>
                                        <td className="py-3 px-4">{user.username || '-'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-sm ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {user.subscription ? (
                                                <span className="text-green-600">Active</span>
                                            ) : (
                                                <span className="text-gray-400">None</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button className="text-blue-600 hover:text-blue-800 mr-3">
                                                Edit
                                            </button>
                                            <button className="text-purple-600 hover:text-purple-800">
                                                Impersonate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                            disabled={filters.page === 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {filters.page} of {Math.ceil(total / filters.limit)}
                        </span>
                        <button
                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                            disabled={filters.page >= Math.ceil(total / filters.limit)}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
