import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Download } from 'lucide-react';
import { generatePayslipPDF } from '../utils/payslipGenerator';

const Payroll = () => {
    const [payslips, setPayslips] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchPayslips();
    }, []);

    const fetchPayslips = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/payroll', config);
            setPayslips(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Payslips</h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Month</th>
                                <th className="px-6 py-4">Basic Salary</th>
                                <th className="px-6 py-4">Allowances</th>
                                <th className="px-6 py-4">Deductions</th>
                                <th className="px-6 py-4">Net Salary</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                             {payslips.map((slip) => (
                                <tr key={slip._id}>
                                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{slip.month}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors">${slip.basicSalary}</td>
                                    <td className="px-6 py-4 text-green-600 dark:text-green-400">+${slip.allowances}</td>
                                    <td className="px-6 py-4 text-red-600 dark:text-red-400">-${slip.deductions}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">${slip.netSalary}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${slip.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {slip.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => generatePayslipPDF(slip)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 text-sm font-medium"
                                        >
                                            <Download className="w-4 h-4" /> Download
                                        </button>
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

export default Payroll;
