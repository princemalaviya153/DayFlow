import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, DollarSign, User } from 'lucide-react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

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
        </Layout>
    );
};

export default EmployeeDashboard;
