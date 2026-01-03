import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
             const token = localStorage.getItem('token');
             if (token) {
                 try {
                     const config = {
                         headers: {
                             Authorization: `Bearer ${token}`
                         }
                     };
                     const { data } = await axios.get('http://localhost:5000/api/auth/verify', config);
                     setUser({ ...data, token });
                 } catch (error) {
                     console.error("Auth verification failed", error);
                     localStorage.removeItem('token');
                     setUser(null);
                 }
             }
             setLoading(false);
        };
        verifyUser();
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data);
        return data; // Return data for redirection logic
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
