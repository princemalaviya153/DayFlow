import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Pin, Calendar, User, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import AnnouncementModal from '../components/AnnouncementModal';

const Noticeboard = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'General', 'Holiday', 'Policy', 'Urgent'];

    useEffect(() => {
        fetchAnnouncements();
    }, [activeTab]);

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const query = activeTab !== 'All' ? `?category=${activeTab}` : '';
            const { data } = await api.get(`/announcements${query}`, config);
            setAnnouncements(data);
        } catch (error) {
            console.error("Error fetching announcements", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedAnnouncement(null);
        setShowModal(true);
    };

    const handleEdit = (announcement) => {
        setSelectedAnnouncement(announcement);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.delete(`/announcements/${id}`, config);
            fetchAnnouncements();
        } catch (error) {
            alert('Failed to delete announcement');
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post(`/announcements/${id}/read`, {}, config);
            fetchAnnouncements(); // Refresh to update read status
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
            case 'Holiday': return 'bg-green-100 text-green-700 border-green-200';
            case 'Policy': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Noticeboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Company announcements and updates</p>
                </div>

                {user?.role === 'Admin' && (
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Create Announcement
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto space-x-2 mb-6 hide-scrollbar pb-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => { setActiveTab(cat); setLoading(true); }}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === cat
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No announcements found</h3>
                    <p className="text-gray-500 mt-1">There are no {activeTab !== 'All' ? activeTab.toLowerCase() : ''} announcements at the moment.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className={`bg-white dark:bg-gray-800 rounded-xl border ${announcement.isPinned ? 'border-amber-300 dark:border-amber-600 shadow-md' : 'border-gray-200 dark:border-gray-700 shadow-sm'} overflow-hidden transition-all hover:shadow-md`}>

                            {/* Header */}
                            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {announcement.isPinned && (
                                            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded-md">
                                                <Pin className="w-3 h-3" /> Pinned
                                            </span>
                                        )}
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${getCategoryStyles(announcement.category)}`}>
                                            {announcement.category}
                                        </span>
                                        {announcement.priority === 'High' && (
                                            <span className="text-xs font-bold px-2 py-1 bg-red-600 text-white rounded-md uppercase tracking-wider">
                                                High Priority
                                            </span>
                                        )}
                                        {!announcement.isReadByMe && (
                                            <span className="flex items-center h-2 w-2 rounded-full bg-blue-600" title="New / Unread" />
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{announcement.title}</h2>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> {announcement.author.firstName} {announcement.author.lastName}</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(announcement.publishedAt)}</span>
                                    </div>
                                </div>

                                {/* Admin Actions */}
                                {user?.role === 'Admin' && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600" title="Total Views">
                                            <Eye className="w-4 h-4" /> {announcement._count.reads}
                                        </div>
                                        <button onClick={() => handleEdit(announcement)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(announcement.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Content body */}
                            <div className="p-5 prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: announcement.content }} />

                            {/* Footer / Read Action */}
                            {!announcement.isReadByMe && (
                                <div className="px-5 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800/50 flex justify-between items-center">
                                    <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">Please acknowledge that you have read this announcement.</span>
                                    <button
                                        onClick={() => markAsRead(announcement.id)}
                                        className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                                    >
                                        Mark as Read
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <AnnouncementModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onRefresh={fetchAnnouncements}
                existingData={selectedAnnouncement}
            />
        </Layout>
    );
};

export default Noticeboard;
