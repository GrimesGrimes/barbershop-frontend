import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../api/types';
import authApi, { type LoginRequest } from '../api/auth';

/**
 * Safely parse JSON from localStorage, handling invalid values gracefully
 */
function safeJSONParse<T>(value: string | null): T | null {
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch (err) {
        // Silently handle invalid values - they'll be cleared on next login
        return null;
    }
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credential: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
    verifyPhone: (code: string) => Promise<void>;   // OPCIONAL - ya no bloquea reservas
    verifyEmail: (code: string) => Promise<void>;   // NUEVO - REQUERIDO para reservas
    setAuth: (user: User, token: string) => void;   // Allows manual state update (e.g. after register)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => safeJSONParse<User>(localStorage.getItem('user')));
    // FIX: Read token as raw string, DO NOT parse it as JSON
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Validate loaded state on mount
    useEffect(() => {
        setIsLoading(false);
    }, []);

    const setAuth = useCallback((newUser: User, newToken: string) => {
        setUser(newUser);
        setToken(newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        // FIX: Store token as raw string
        localStorage.setItem('token', newToken);
    }, []);

    const login = useCallback(async (credential: string, password: string) => {
        const data: LoginRequest = { credential, password };
        const response = await authApi.login(data);

        // Validate response before storing
        if (!response || !response.user || !response.token) {
            throw new Error('Invalid login response: missing user or token');
        }

        // Store in state using setAuth
        setAuth(response.user, response.token);
    }, [setAuth]);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const updateUser = useCallback((updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }, []);

    /**
     * Phone verification (OPCIONAL - no bloquea funcionalidad)
     */
    const verifyPhone = useCallback(async (code: string) => {
        if (!user?.phone) {
            throw new Error('No se encontró un número de teléfono asociado a tu cuenta');
        }

        await authApi.confirmPhoneVerification(user.phone, code);

        // Update user state locally
        const updatedUser = { ...user, phoneVerified: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }, [user]);

    /**
     * Email verification (NUEVO - REQUERIDO para crear reservas)
     */
    const verifyEmail = useCallback(async (code: string) => {
        if (!user?.email) {
            throw new Error('No se encontró un correo electrónico asociado a tu cuenta');
        }

        const response = await authApi.confirmEmailVerification(code);

        // Update user state with verified email
        const updatedUser = response.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }, [user]);

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
        verifyPhone,
        verifyEmail,
        setAuth
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
