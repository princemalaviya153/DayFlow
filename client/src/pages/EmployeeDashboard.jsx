import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, DollarSign, User, Megaphone, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [latestAnnouncements, setLatestAnnouncements] = React.useState([]);

    React.useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await api.get('/announcements', config);
                setLatestAnnouncements(data.slice(0, 3));
            } catch (err) {
                console.error(err);
            }
        };
        fetchAnnouncements();
    }, []);

    return (
        <Layout>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Good Morning, {user?.firstName}!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">You are marked as <span className="text-green-600 font-medium">Present</span> today.</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-400">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => navigate('/dashboard/leave')}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">Leave Request</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Apply for sick or casual leave.</p>
                </div>

                <div
                    onClick={() => navigate('/dashboard/payslips')}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">Payslips</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View salary details and history.</p>
                </div>

                <div
                    onClick={() => navigate('/dashboard/profile')}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">My Profile</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your contact info.</p>
                </div>
            </div>

            {/* Dashboard Alerts and Announcements */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

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
                            onClick={() => navigate('/dashboard/noticeboard')}
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
                        <button onClick={() => navigate('/dashboard/noticeboard')} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            View All
                        </button>
                    </div>

                    {latestAnnouncements.length === 0 ? (
                        <p className="text-gray-500 text-sm">No recent announcements.</p>
                    ) : (
                        <div className="space-y-3">
                            {latestAnnouncements.map(ann => (
                                <div key={ann.id} className="flex justify-between items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition border border-gray-100 dark:border-gray-700 cursor-pointer" onClick={() => navigate('/dashboard/noticeboard')}>
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

export default EmployeeDashboard;
