import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const login = (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        navigate('/login');
    };

    const refreshToken = async () => {
        try {
            const storedRefreshToken = localStorage.getItem('refreshToken');
            if (!storedRefreshToken) throw new Error('Refresh token missing');

            const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: storedRefreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.access);
                return data.access;
            } else {
                throw new Error('Failed to refresh token');
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            logout();
            return null;
        }
    };

    const checkAuthentication = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/users/me/', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setIsAuthenticated(true);
            } else if (response.status === 401) {
                const newToken = await refreshToken();
                setIsAuthenticated(!!newToken);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthentication();
    }, []);

    const fetchWithRefresh = async (url, options = {}) => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            logout();
            return null;
        }

        const response = await fetch(url, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
            const newToken = await refreshToken();
            if (newToken) {
                return fetch(url, {
                    ...options,
                    headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
                });
            } else {
                logout();
                navigate('/login');
            }
        }

        return response;
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, fetchWithRefresh }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
