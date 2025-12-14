import apiClient from './client';
import type { User, Barbershop, Gender, NotificationChannel } from './types';

export interface UpdateProfileRequest {
    fullName?: string;
    phone?: string | null;          // Opcional - para actualizar teléfono
    avatarUrl?: string | null;
    gender?: Gender;
    birthDate?: string | null; // ISO string or null
    notificationChannel?: NotificationChannel;
    marketingOptIn?: boolean;
    language?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateBarbershopRequest {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    description?: string;
    openTime?: string;
    closeTime?: string;
    slotMinutes?: number;
    logoUrl?: string;
    bookingPolicy?: string;
}

export const usersApi = {
    getMe: async (): Promise<User> => {
        const response = await apiClient.get<User>('/users/me');
        return response.data;
    },

    updateMe: async (data: UpdateProfileRequest): Promise<User> => {
        const response = await apiClient.put<User>('/users/me', data);
        return response.data;
    },

    changePassword: async (data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.put('/users/me/password', data);
        return response.data;
    },

    updateBarbershop: async (data: UpdateBarbershopRequest): Promise<Barbershop> => {
        const response = await apiClient.put<Barbershop>('/users/owner/profile', data);
        return response.data;
    },
};

export default usersApi;
