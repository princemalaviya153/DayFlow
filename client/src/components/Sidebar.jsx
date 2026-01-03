import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    FileText, 
    LogOut, 
    DollarSign,
    User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const allNavItems = [
        { icon: LayoutDashboard, text: 'Dashboard', path: '/admin', roles: ['Admin'] },
        { icon: Users, text: 'Employees', path: '/admin/employees', roles: ['Admin'] },
        { icon: Calendar, text: 'Attendance', path: '/admin/attendance', roles: ['Admin'] },
        { icon: FileText, text: 'Leave', path: '/admin/leave', roles: ['Admin'] },
        { icon: DollarSign, text: 'Payroll', path: '/admin/payroll', roles: ['Admin'] },

        { icon: LayoutDashboard, text: 'Dashboard', path: '/dashboard', roles: ['Employee'] },
        { icon: Calendar, text: 'Attendance', path: '/dashboard/attendance', roles: ['Employee'] },
        { icon: FileText, text: 'Leave', path: '/dashboard/leave', roles: ['Employee'] },
        { icon: DollarSign, text: 'Payslips', path: '/dashboard/payslips', roles: ['Employee'] },
        { icon: User, text: 'My Profile', path: '/dashboard/profile', roles: ['Admin', 'Employee'] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(user?.role));

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Dayflow</h1>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin' || item.path === '/dashboard'} 
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.text}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
