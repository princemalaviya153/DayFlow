import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const AddEmployeeModal = ({ isOpen, onClose, onAdd, initialData = null }) => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', employeeId: '', password: '', 
        designation: '', department: '', phone: '', address: '', role: 'Employee',
        basicSalary: '', hra: '', allowances: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                email: initialData.email || '',
                employeeId: initialData.employeeId || '',
                password: '', // Keep blank if not changing
                designation: initialData.designation || '',
                department: initialData.department || '',
                phone: initialData.phone || '',
                address: initialData.address || '',
                role: initialData.role || 'Employee',
                basicSalary: initialData.salaryStructure?.basic || '',
                hra: initialData.salaryStructure?.hra || '',
                allowances: initialData.salaryStructure?.allowances || ''
            });
        } else {
            setFormData({
                firstName: '', lastName: '', email: '', employeeId: '', password: '', 
                designation: '', department: '', phone: '', address: '', role: 'Employee',
                basicSalary: '', hra: '', allowances: ''
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const payload = {
            ...formData,
            salaryStructure: {
                basic: Number(formData.basicSalary),
                hra: Number(formData.hra),
                allowances: Number(formData.allowances)
            }
        };

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (initialData) {
                 await axios.put(`http://localhost:5000/api/users/${initialData._id}`, payload, config);
            } else {
                 await axios.post('http://localhost:5000/api/employees', payload, config);
            }
            
            onAdd();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {initialData ? 'Edit Employee' : 'Add New Employee'}
                    </h3>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required className="input-field" />
                        <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required className="input-field" />
                        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="input-field" />
                        <input name="employeeId" placeholder="Employee ID" value={formData.employeeId} onChange={handleChange} required className="input-field" disabled={!!initialData} />
                    </div>

                    {!initialData && (
                         <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input-field w-full" />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <input name="designation" placeholder="Designation" value={formData.designation} onChange={handleChange} className="input-field" />
                        <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} className="input-field" />
                        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="input-field" />
                        <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                            <option value="Employee">Employee</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="input-field w-full" rows="2" />

                    <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Salary Structure</h4>
                        <div className="grid grid-cols-3 gap-4">
                             <input name="basicSalary" type="number" placeholder="Basic Salary" value={formData.basicSalary} onChange={handleChange} className="input-field" />
                             <input name="hra" type="number" placeholder="HRA" value={formData.hra} onChange={handleChange} className="input-field" />
                             <input name="allowances" type="number" placeholder="Allowances" value={formData.allowances} onChange={handleChange} className="input-field" />
                        </div>
                    </div>

                    <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                        {initialData ? 'Update Employee' : 'Create Employee'}
                    </button>
                </form>
            </div>
            
            <style jsx>{`
                .input-field {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    background-color: transparent;
                }
                :global(.dark) .input-field {
                    border-color: #4b5563;
                    color: white;
                }
                .input-field:focus {
                    outline: 2px solid #3b82f6;
                    border-color: transparent;
                }
            `}</style>
        </div>
    );
};

export default AddEmployeeModal;
