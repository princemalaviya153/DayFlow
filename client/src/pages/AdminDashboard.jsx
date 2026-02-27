import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Megaphone, AlertCircle, Users, Calendar, Briefcase, DollarSign } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [summary, setSummary] = useState({
        totalEmployees: 0,
        presentToday: 0,
        onLeaveToday: 0,
        totalPayrollPending: 0
    });
    const [latestAnnouncements, setLatestAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await api.get('/dashboard/summary', config);
                setSummary(data);

                const { data: annData } = await api.get('/announcements', config);
                setLatestAnnouncements(annData.slice(0, 3));
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    };

    return (
        <Layout>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Employees" value={loading ? '...' : summary?.totalEmployees} icon={Users} color="bg-blue-500" />
                <StatCard title="Present Today" value={loading ? '...' : summary?.presentToday} icon={Calendar} color="bg-green-500" />
                <StatCard title="On Leave" value={loading ? '...' : summary?.onLeaveToday} icon={Briefcase} color="bg-orange-500" />
                <StatCard title="Payroll Pending" value={loading ? '...' : formatCurrency(summary?.totalPayrollPending)} icon={DollarSign} color="bg-purple-500" />
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/admin/employees')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Manage Employees
                    </button>
                    <button
                        onClick={() => navigate('/admin/attendance')}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        View Attendance
                    </button>
                </div>
            </div>

            {/* Dashboard Alerts and Announcements */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Urgent Announcements Banner */}
                {latestAnnouncements.some(a => a.category === 'Urgent' && !a.isReadByMe) && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            <h3 className="text-lg font-bold text-red-800 dark:text-red-300">Urgent Notice</h3>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-200 mb-4">
                            You have unread urgent announcements that require your attention.
                        </p>
                        <button
                            onClick={() => navigate('/admin/noticeboard')}
                            className="w-fit px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
                        >
                            View Noticeboard
                        </button>
                    </div>
                )}

                {/* Latest Announcements Widget */}
                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${!latestAnnouncements.some(a => a.category === 'Urgent' && !a.isReadByMe) ? 'lg:col-span-2' : ''}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-blue-600" /> Latest Announcements
                        </h2>
                        <button onClick={() => navigate('/admin/noticeboard')} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            View All
                        </button>
                    </div>

                    {latestAnnouncements.length === 0 ? (
                        <p className="text-gray-500 text-sm">No recent announcements.</p>
                    ) : (
                        <div className="space-y-3">
                            {latestAnnouncements.map(ann => (
                                <div key={ann.id} className="flex justify-between items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition border border-gray-100 dark:border-gray-700 cursor-pointer" onClick={() => navigate('/admin/noticeboard')}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white">{ann.title}</h4>
                                            {!ann.isReadByMe && <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">New</span>}
                                        </div>
                                        <div className="text-xs text-gray-500 flex gap-2">
                                            <span>{ann.category}</span>
                                            <span>•</span>
                                            <span>{new Date(ann.publishedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </Layout>
    );
};

export default AdminDashboard;
