import React, { useState, useEffect } from 'react';
import { Bell, Check, X, CheckSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Get unread count
            const { data: countData } = await api.get('/notifications/unread-count', config);

            // If new unread, maybe show a toast
            if (countData.count > unreadCount && unreadCount !== 0) {
                toast("You have new notifications", { icon: '🔔' });
            }

            setUnreadCount(countData.count);

            // Fetch the actual notifications for the dropdown
            const { data: notifData } = await api.get('/notifications', config);
            setNotifications(notifData.slice(0, 5)); // Just show recent 5 in dropdown
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Poll every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, [unreadCount]);

    const handleMarkAsRead = async (e, id) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.patch(`/notifications/${id}/read`, {}, config);

            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.patch(`/notifications/read-all`, {}, config);

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("All marked as read");
        } catch (error) {
            console.error(error);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (notification) => {
        setIsOpen(false);
        if (!notification.isRead) {
            handleMarkAsRead({ stopPropagation: () => { } }, notification.id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl.startsWith('/dashboard') || notification.actionUrl.startsWith('/admin') ? notification.actionUrl : `/dashboard${notification.actionUrl}`);
        }
    };

    // Close click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest('#notification-bell-container')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div id="notification-bell-container" className="relative mr-4 items-center flex">
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border border-white dark:border-gray-800">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                            >
                                <CheckSquare className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150 ease-in-out ${notification.isRead ? 'opacity-70' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                    {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(e, notification.id)}
                                                    className="p-1 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/50 dark:hover:bg-blue-800 transition"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No new notifications</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800/50">
                        <Link
                            to="/dashboard/notifications"
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                        >
                            View All Notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
