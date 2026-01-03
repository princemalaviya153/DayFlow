import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';

import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeList from './pages/EmployeeList';
import Attendance from './pages/Attendance';
import AdminAttendance from './pages/AdminAttendance';
import Leave from './pages/Leave';
import AdminLeave from './pages/AdminLeave';
import Payroll from './pages/Payroll';
import AdminPayroll from './pages/AdminPayroll';
import Profile from './pages/Profile';

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
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
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
                    path="/dashboard/profile" 
                    element={
                        <ProtectedRoute allowedRoles={['Employee', 'Admin']}>
                            <Profile />
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
        </AuthProvider>
    </Router>
  );
}

export default App;
