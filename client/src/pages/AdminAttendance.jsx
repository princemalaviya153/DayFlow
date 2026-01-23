import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Calendar as CalendarIcon, User, Search } from 'lucide-react';

const AdminAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await api.get('/attendance/all', config);
                setAttendanceData(data);
            } catch (error) {
                console.error("Error fetching attendance", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const getStatusColor = (status) => {
         if (status === 'Present') return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
        if (status === 'Absent') return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
        if (status === 'Half-day') return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Reports</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                     <div className="relative max-w-sm">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search employee..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Check In</th>
                                <th className="px-6 py-4">Check Out</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Hours</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                             {loading ? <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr> : 
                              attendanceData.map((rec) => (
                                <tr key={rec._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{rec.user?.firstName} {rec.user?.lastName}</div>
                                        <div className="text-xs text-gray-500">{rec.user?.employeeId}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {new Date(rec.date).toLocaleDateString()}
                                    </td>
                                     <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : '-'}
                                    </td>
                                     <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rec.status)}`}>
                                            {rec.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {rec.workHours || '-'}
                                    </td>
                                </tr>
                              ))
                             }
                         </tbody>
                    </table>
                 </div>
            </div>
        </Layout>
    );
};

export default AdminAttendance;
