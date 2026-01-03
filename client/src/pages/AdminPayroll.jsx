import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Plus, Trash2, Download } from 'lucide-react';
import { generatePayslipPDF } from '../utils/payslipGenerator';

const AdminPayroll = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '', month: '', basicSalary: '', allowances: '', deductions: ''
    });
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const fetchPayrolls = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/payroll/all', config);
            setPayrolls(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/payroll', formData, config);
            setShowModal(false);
            fetchPayrolls();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to generate payslip');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/payroll/${id}`, { status }, config);
            fetchPayrolls();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this payroll record?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/payroll/${id}`, config);
                fetchPayrolls();
            } catch (error) {
                alert('Failed to delete record');
            }
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Payroll</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    Generate Payslip
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Month</th>
                                <th className="px-6 py-4">Basic</th>
                                <th className="px-6 py-4">Allowances</th>
                                <th className="px-6 py-4">Deductions</th>
                                <th className="px-6 py-4">Net Salary</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                             {payrolls.map((payroll) => (
                                <tr key={payroll._id}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{payroll.user?.firstName} {payroll.user?.lastName}</div>
                                        <div className="text-xs text-gray-500">{payroll.user?.employeeId}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{payroll.month}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">${payroll.basicSalary}</td>
                                    <td className="px-6 py-4 text-green-600 dark:text-green-400">+${payroll.allowances}</td>
                                    <td className="px-6 py-4 text-red-600 dark:text-red-400">-${payroll.deductions}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">${payroll.netSalary}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${payroll.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {payroll.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {payroll.status === 'Pending' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(payroll._id, 'Paid')}
                                                    className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded border border-green-200 hover:bg-green-100 transition-colors"
                                                    title="Mark as Paid"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(payroll._id)}
                                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                title="Delete Record"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => generatePayslipPDF(payroll)}
                                                className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                                title="Download PDF"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate Payslip</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
                                <input name="employeeId" required onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month (e.g. Jan 2026)</label>
                                <input name="month" required onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Basic Salary</label>
                                    <input name="basicSalary" type="number" required onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allowances</label>
                                    <input name="allowances" type="number" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deductions</label>
                                    <input name="deductions" type="number" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg dark:bg-gray-700">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Generate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminPayroll;
