import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../utils/api';

const AnnouncementModal = ({ isOpen, onClose, onRefresh, existingData = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General',
        priority: 'Normal',
        targetRole: 'All',
        isPinned: false,
        expiresAt: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (existingData) {
            setFormData({
                title: existingData.title,
                content: existingData.content,
                category: existingData.category,
                priority: existingData.priority,
                targetRole: existingData.targetRole,
                isPinned: existingData.isPinned,
                expiresAt: existingData.expiresAt ? new Date(existingData.expiresAt).toISOString().split('T')[0] : ''
            });
        } else {
            setFormData({
                title: '',
                content: '',
                category: 'General',
                priority: 'Normal',
                targetRole: 'All',
                isPinned: false,
                expiresAt: ''
            });
        }
    }, [existingData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                ...formData,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
            };

            if (existingData) {
                await api.put(`/announcements/${existingData.id}`, payload, config);
            } else {
                await api.post('/announcements', payload, config);
            }
            onRefresh();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save announcement');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {existingData ? 'Edit Announcement' : 'Create New Announcement'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <form id="announcement-form" onSubmit={handleSubmit} className="space-y-4 text-gray-900 dark:text-gray-100">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent"
                                placeholder="Enter announcement title"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                                    <option value="General" className="bg-white dark:bg-gray-800">General</option>
                                    <option value="Holiday" className="bg-white dark:bg-gray-800">Holiday</option>
                                    <option value="Policy" className="bg-white dark:bg-gray-800">Policy</option>
                                    <option value="Urgent" className="bg-white dark:bg-gray-800">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Priority</label>
                                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                                    <option value="Normal" className="bg-white dark:bg-gray-800">Normal</option>
                                    <option value="High" className="bg-white dark:bg-gray-800">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Target Role</label>
                                <select name="targetRole" value={formData.targetRole} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                                    <option value="All" className="bg-white dark:bg-gray-800">All Staff</option>
                                    <option value="Employee" className="bg-white dark:bg-gray-800">Employees Only</option>
                                    <option value="Admin" className="bg-white dark:bg-gray-800">Admins Only</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Expires At (Optional)</label>
                                <input
                                    type="date"
                                    name="expiresAt"
                                    value={formData.expiresAt}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="isPinned"
                                name="isPinned"
                                checked={formData.isPinned}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="isPinned" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Pin to top of noticeboard
                            </label>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-medium mb-1">Content</label>
                            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 p-1">
                                <textarea
                                    required
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    className="w-full h-64 p-3 bg-transparent border-none focus:ring-0 resize-none text-base placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Write your announcement here..."
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="announcement-form"
                        disabled={isLoading || !formData.title || !formData.content}
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Announcement'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementModal;
