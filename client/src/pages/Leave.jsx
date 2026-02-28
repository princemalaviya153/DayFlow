import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Clock, Plus, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Leave = () => {
    const [leaves, setLeaves] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        leaveType: 'Sick',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [error, setError] = useState('');

    const fetchLeaves = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await api.get('/leaves', config);
            setLeaves(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/leaves', formData, config);
            setShowModal(false);
            fetchLeaves();
            setFormData({ leaveType: 'Sick', startDate: '', endDate: '', reason: '' });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to submit leave request');
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'Approved') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (status === 'Rejected') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Leaves</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    Apply Leave
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">From</th>
                                <th className="px-6 py-4">To</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {leaves.map((leave) => (
                                <tr key={leave._id}>
                                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{leave.leaveType}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(leave.startDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(leave.endDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">{leave.reason}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(leave.status)}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Apply for Leave</h3>
                            <button onClick={() => setShowModal(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                    value={formData.leaveType}
                                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                >
                                    <option value="Paid" className="bg-white dark:bg-gray-700">Paid</option>
                                    <option value="Sick" className="bg-white dark:bg-gray-700">Sick</option>
                                    <option value="Unpaid" className="bg-white dark:bg-gray-700">Unpaid</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    rows="3"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit Request</button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Leave;
