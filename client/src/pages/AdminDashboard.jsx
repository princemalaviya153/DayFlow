import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, Briefcase, DollarSign } from 'lucide-react';
import Layout from '../components/Layout';

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

import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        onLeaveToday: 0,
        totalPayrollPending: 0
    });
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/dashboard/summary', config);
                setStats(data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <Layout>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Employees" value={loading ? '...' : stats.totalEmployees} icon={Users} color="bg-blue-500" />
                <StatCard title="Present Today" value={loading ? '...' : stats.presentToday} icon={Calendar} color="bg-green-500" />
                <StatCard title="On Leave" value={loading ? '...' : stats.onLeaveToday} icon={Briefcase} color="bg-orange-500" />
                <StatCard title="Payroll Pending" value={loading ? '...' : formatCurrency(stats.totalPayrollPending)} icon={DollarSign} color="bg-purple-500" />
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
        </Layout>
    );
};

export default AdminDashboard;
