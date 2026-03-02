import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="pl-0 lg:pl-64 min-h-screen transition-all duration-300">
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {/* Hamburger menu – mobile only */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Overview
                        </h2>
                    </div>
                    <div className="flex items-center">
                        <NotificationBell />

                        <Link to="/dashboard/profile" className="flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors cursor-pointer border-l pl-4 border-gray-200 dark:border-gray-700">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user?.firstName} {user?.lastName}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                        </Link>
                    </div>
                </header>
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

