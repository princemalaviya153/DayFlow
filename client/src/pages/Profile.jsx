import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import api from '../utils/api';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Camera, Upload, Edit, FileText, DollarSign, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', dob: '', gender: '', phone: '', address: '', profilePicture: ''
    });
    const [preferences, setPreferences] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await api.get('/users/profile', config);
            setProfile(data);
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                dob: data.dob || '',
                gender: data.gender || '',
                phone: data.phone || '',
                address: data.address || '',
                profilePicture: data.profilePicture || ''
            });

            // Fetch notification preferences
            const { data: prefData } = await api.get('/notifications/preferences', config);
            setPreferences(prefData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreferenceChange = async (type, field, value) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Find current state
            const current = preferences.find(p => p.notificationType === type) || {
                inAppEnabled: true, emailEnabled: true
            };

            const payload = {
                notificationType: type,
                inAppEnabled: field === 'inAppEnabled' ? value : current.inAppEnabled,
                emailEnabled: field === 'emailEnabled' ? value : current.emailEnabled
            };

            await api.put('/notifications/preferences', payload, config);
            toast.success('Preference updated');

            // Update local state
            setPreferences(prev => {
                const exists = prev.find(p => p.notificationType === type);
                if (exists) {
                    return prev.map(p => p.notificationType === type ? { ...p, [field]: value } : p);
                } else {
                    return [...prev, { ...payload, notificationType: type }];
                }
            });
        } catch (error) {
            toast.error('Failed to update preference');
            console.error(error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.put('/users/profile', formData, config);
            setShowEditModal(false);
            fetchProfile();
            alert('Profile updated successfully');
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    if (loading) return <Layout><div className="flex justify-center p-10">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                </button>
            </div>

            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                    {profile.profilePicture ? (
                        <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-12 h-12 text-gray-400" />
                    )}
                </div>
                <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.firstName} {profile.lastName}</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{profile.designation || 'Employee'} • {profile.department || 'General'}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1"><Mail className="w-4 h-4" /> {profile.email}</div>
                        <div className="flex items-center gap-1"><Phone className="w-4 h-4" /> {profile.phone || 'N/A'}</div>
                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.address || 'N/A'}</div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('salary')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'salary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Salary Structure
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Documents
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'notifications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Notifications
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[300px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><User className="w-5 h-5 text-blue-500" /> Personal Details</h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Full Name</span> <span className="col-span-2 text-gray-900 dark:text-white font-medium">{profile.firstName} {profile.lastName}</span></div>
                                <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Date of Birth</span> <span className="col-span-2 text-gray-900 dark:text-white font-medium">{profile.dob ? new Date(profile.dob).toLocaleDateString() : '-'}</span></div>
                                <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Gender</span> <span className="col-span-2 text-gray-900 dark:text-white font-medium">{profile.gender || '-'}</span></div>
                                <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Address</span> <span className="col-span-2 text-gray-900 dark:text-white font-medium">{profile.address || '-'}</span></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-500" /> Job Details</h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Employee ID</span> <span className="col-span-2 text-gray-900 dark:text-white font-medium">{profile.employeeId}</span></div>
                                <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Department</span> <span className="col-span-2 text-gray-900 dark:text-white font-medium">{profile.department}</span></div>
                                <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Designation</span> <span className="col-span-2 text-gray-900 dark:text-white font-medium">{profile.designation}</span></div>
                                <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Joining Date</span> <span className="col-span-2 text-gray-900 dark:text-white font-medium">{new Date(profile.joinedDate).toLocaleDateString()}</span></div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'salary' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" /> Salary Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-500">Basic Salary</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">${profile.salaryStructure?.basic || 0}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-500">HRA</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">${profile.salaryStructure?.hra || 0}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-500">Other Allowances</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">${profile.salaryStructure?.allowances || 0}</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                                <p className="text-sm text-green-600 dark:text-green-400">Gross Salary</p>
                                <p className="text-xl font-bold text-green-700 dark:text-green-400">
                                    ${(profile.salaryStructure?.basic || 0) + (profile.salaryStructure?.hra || 0) + (profile.salaryStructure?.allowances || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-orange-500" /> Documents</h3>
                        {profile.documents && profile.documents.length > 0 ? (
                            <ul className="space-y-2">
                                {profile.documents.map((doc, index) => (
                                    <li key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{doc.name}</span>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View</a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No documents uploaded.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-purple-500" /> Notification Preferences</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose how you want to be notified about important updates.</p>

                        <div className="space-y-4 max-w-2xl">
                            {['LEAVE_UPDATE', 'PAYSLIP', 'ANNOUNCEMENT'].map((type) => {
                                const pref = preferences.find(p => p.notificationType === type) || {
                                    inAppEnabled: true, emailEnabled: true
                                };

                                const labels = {
                                    'LEAVE_UPDATE': { title: 'Leave Updates', desc: 'When your leave request is approved or rejected' },
                                    'PAYSLIP': { title: 'Payslip Generation', desc: 'When a new payslip is generated for you' },
                                    'ANNOUNCEMENT': { title: 'Company Announcements', desc: 'When a new notice is published on the board' }
                                };

                                return (
                                    <div key={type} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">{labels[type].title}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{labels[type].desc}</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={pref.inAppEnabled}
                                                    onChange={(e) => handlePreferenceChange(type, 'inAppEnabled', e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In-App</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={pref.emailEnabled}
                                                    onChange={(e) => handlePreferenceChange(type, 'emailEnabled', e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h3>
                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.dob ? formData.dob.split('T')[0] : ''}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="" className="bg-white dark:bg-gray-700">Select Gender</option>
                                    <option value="Male" className="bg-white dark:bg-gray-700">Male</option>
                                    <option value="Female" className="bg-white dark:bg-gray-700">Female</option>
                                    <option value="Other" className="bg-white dark:bg-gray-700">Other</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    rows="2"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Picture</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                            {formData.profilePicture ? (
                                                <img src={formData.profilePicture} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-full h-full text-gray-400 p-2" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Enter Image URL"
                                            className="w-full px-3 py-2 mb-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.profilePicture}
                                            onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                                        />
                                        <div className="flex items-center gap-2">
                                            <label className="cursor-pointer px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors">
                                                <span>Upload File</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;

                                                        const uploadData = new FormData();
                                                        uploadData.append('image', file);

                                                        try {
                                                            const token = localStorage.getItem('token');
                                                            const config = {
                                                                headers: {
                                                                    'Content-Type': 'multipart/form-data',
                                                                    Authorization: `Bearer ${token}`
                                                                }
                                                            };
                                                            const { data } = await api.post('/upload', uploadData, config);

                                                            // data is the file path e.g. /uploads/image-123.jpg
                                                            // We need to construct full URL for display if it's absolute, or if it's relative
                                                            // Ideally the backend returns partial path.

                                                            const fullUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}${data}`;
                                                            setFormData(prev => ({ ...prev, profilePicture: fullUrl }));

                                                        } catch (error) {
                                                            console.error("Upload failed", error);
                                                            alert('Image upload failed');
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <span className="text-xs text-gray-500">JPG, PNG only</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg dark:bg-gray-700">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Profile;
