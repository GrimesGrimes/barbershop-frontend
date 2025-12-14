import apiClient from './client';
import type { AuthResponse, User } from './types';

export interface LoginRequest {
    credential: string; // phone or username
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    username: string;
    email: string;       // NUEVO: Obligatorio
    phone?: string;      // Ahora opcional
    password: string;
}

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<{ user: User; token: string; message: string }> => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    /**
     * Phone Verification (OPTIONAL - no longer blocks bookings)
     */
    requestPhoneVerification: async (phone: string): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/auth/verify-phone/request', { phone });
        return response.data;
    },

    confirmPhoneVerification: async (phone: string, code: string): Promise<{ message: string }> => {
        const response = await apiClient.post('/auth/verify-phone/confirm', { phone, code });
        return response.data;
    },

    /**
     * Email Verification (NEW - REQUIRED for bookings)
     * Backend endpoints:
     * - POST /api/auth/verify-email/request - Envía código a email del usuario autenticado
     * - POST /api/auth/verify-email/confirm { code: string } - Confirma y retorna user actualizado
     */
    requestEmailVerification: async (): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/auth/verify-email/request');
        return response.data;
    },

    confirmEmailVerification: async (code: string): Promise<{ user: User; message: string }> => {
        const response = await apiClient.post<{ user: User; message: string }>(
            '/auth/verify-email/confirm',
            { code }
        );
        return response.data;
    },

    /**
     * Password Reset (using phone)
     */
    requestPasswordReset: async (phone: string): Promise<{ message: string }> => {
        const response = await apiClient.post('/auth/password-reset/request', { phone });
        return response.data;
    },

    confirmPasswordReset: async (
        phone: string,
        code: string,
        newPassword: string
    ): Promise<{ message: string }> => {
        const response = await apiClient.post('/auth/password-reset/confirm', {
            phone,
            code,
            newPassword,
        });
        return response.data;
    },

    /**
     * Get current user profile
     */
    getMe: async (): Promise<User> => {
        const response = await apiClient.get<User>('/users/me');
        return response.data;
    },
};

export default authApi;
