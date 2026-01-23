import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { MapPin, Clock, LogIn, LogOut, Calendar, CheckCircle } from 'lucide-react';

const Attendance = () => {
    const [attendance, setAttendance] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper to get today's date string YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const fetchAttendance = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await api.get('/attendance', config);
            // data matches the schema: may be an array or single object? 
            // The controller `attendanceController.js` getAttendance returns `find({ user: req.user.id })` which is an array
            setHistory(data);

            // Check if there is a record for today
            const todayRecord = data.find(record => new Date(record.date).toISOString().split('T')[0] === today);
            setAttendance(todayRecord || null);

        } catch (error) {
            console.error("Error fetching attendance", error);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/attendance/checkin', {}, config);
            fetchAttendance();
        } catch (error) {
            alert(error.response?.data?.message || 'Check-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.put('/attendance/checkout', {}, config);
            fetchAttendance();
        } catch (error) {
            alert(error.response?.data?.message || 'Check-out failed');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        if (status === 'Present') return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
        if (status === 'Absent') return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
        if (status === 'Half-day') return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Attendance</h1>

            {/* Daily Action Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{new Date().toDateString()}</p>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                            {attendance ? (attendance.checkOut ? 'Day Completed' : 'Checked In') : 'Not Checked In'}
                        </h2>
                    </div>

                    <div className="flex gap-4">
                        {!attendance && (
                            <button onClick={handleCheckIn} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-green-200 dark:shadow-none">
                                <Clock className="w-5 h-5" />
                                Check In
                            </button>
                        )}
                        {attendance && !attendance.checkOut && (
                            <button onClick={handleCheckOut} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-red-200 dark:shadow-none">
                                <LogOutIcon className="w-5 h-5" />
                                Check Out
                            </button>
                        )}
                        {attendance && attendance.checkOut && (
                            <div className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg font-medium flex items-center gap-2 cursor-not-allowed">
                                <CheckCircle className="w-5 h-5" />
                                Workday Complete
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Attendance History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Check In</th>
                                <th className="px-6 py-4">Check Out</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Work Hours</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {history.map((record) => (
                                <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                                        {new Date(record.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {record.workHours || '-'} hrs
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

const LogOutIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
);

export default Attendance;
