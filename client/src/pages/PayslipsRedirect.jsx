import React from 'react';
import { Navigate } from 'react-router-dom';

const PayslipsRedirect = () => {
    return <Navigate to="/dashboard/payroll" replace />;
}
export default PayslipsRedirect;
