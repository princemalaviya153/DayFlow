import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Bell, Check, CheckSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await api.get('/notifications', config);
            setNotifications(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.patch(`/notifications/${id}/read`, {}, config);

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error(error);
            toast.error('Error marking as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.patch(`/notifications/read-all`, {}, config);

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("All marked as read");
        } catch (error) {
            console.error(error);
            toast.error('Error marking all as read');
        }
    };


    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                        <p className="text-gray-500 dark:text-gray-400">Stay updated on everything happening in your workspace.</p>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                        >
                            <CheckSquare className="w-4 h-4" />
                            Mark All as Read
                        </button>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading notifications...</div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-6 flex items-start gap-4 transition ${notification.isRead ? 'opacity-80' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}
                                >
                                    <div className={`p-3 rounded-full flex-shrink-0 ${notification.isRead ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'}`}>
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-semibold text-base ${notification.isRead ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center gap-3">
                                            {notification.actionUrl && (
                                                <a
                                                    href={notification.actionUrl}
                                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    View Details
                                                </a>
                                            )}
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                >
                                                    <Check className="w-4 h-4" /> Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 text-center">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <Bell className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">You're all caught up!</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                We'll let you know when there's an important update regarding your leaves, payroll, or company announcements.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Notifications;
