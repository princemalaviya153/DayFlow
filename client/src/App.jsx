import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const EmployeeList = lazy(() => import('./pages/EmployeeList'));
const Attendance = lazy(() => import('./pages/Attendance'));
const AdminAttendance = lazy(() => import('./pages/AdminAttendance'));
const Leave = lazy(() => import('./pages/Leave'));
const AdminLeave = lazy(() => import('./pages/AdminLeave'));
const Payroll = lazy(() => import('./pages/Payroll'));
const AdminPayroll = lazy(() => import('./pages/AdminPayroll'));
const Profile = lazy(() => import('./pages/Profile'));
const Noticeboard = lazy(() => import('./pages/Noticeboard'));
const Notifications = lazy(() => import('./pages/Notifications'));

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; // Or forbidden page
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-right" />
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />

                        <Route
                            path="/admin/noticeboard"
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <Noticeboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/employees"
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <EmployeeList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/attendance"
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminAttendance />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['Employee']}>
                                    <EmployeeDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/attendance"
                            element={
                                <ProtectedRoute allowedRoles={['Employee']}>
                                    <Attendance />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/leave"
                            element={
                                <ProtectedRoute allowedRoles={['Employee']}>
                                    <Leave />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/payslips"
                            element={
                                <ProtectedRoute allowedRoles={['Employee']}>
                                    <Payroll />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/noticeboard"
                            element={
                                <ProtectedRoute allowedRoles={['Employee', 'Admin']}>
                                    <Noticeboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/profile"
                            element={
                                <ProtectedRoute allowedRoles={['Employee', 'Admin']}>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/notifications"
                            element={
                                <ProtectedRoute allowedRoles={['Employee', 'Admin']}>
                                    <Notifications />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/noticeboard"
                            element={
                                <ProtectedRoute allowedRoles={['Employee', 'Admin']}>
                                    <Noticeboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/leave"
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminLeave />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/payroll"
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminPayroll />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </Router>
    );
}

export default App;
