import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Check, X } from 'lucide-react';

const AdminLeave = () => {
    const [leaves, setLeaves] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/leaves/all', config);
            setLeaves(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAction = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/leaves/${id}`, { status }, config);
            fetchLeaves();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Leave Requests</h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">
                             <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Dates</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Current Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {leaves.map((leave) => (
                                <tr key={leave._id}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{leave.user?.firstName} {leave.user?.lastName}</div>
                                        <div className="text-xs text-gray-500">{leave.leaveType}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm max-w-xs truncate">{leave.reason}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full 
                                            ${leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                                              leave.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                              'bg-red-100 text-red-700'}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {leave.status === 'Pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleAction(leave._id, 'Approved')} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200">
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleAction(leave._id, 'Rejected')} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
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

export default AdminLeave;
