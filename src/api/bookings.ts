import apiClient from './client';
import type { Booking, AvailableSlot, Service } from './types';

export interface CreateBookingRequest {
    serviceId: string;
    startTime: string;
    notes?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export const bookingsApi = {
    getAvailableSlots: async (date: string): Promise<AvailableSlot[]> => {
        // Backend returns { slots: [...] }, interceptor unwraps it to response.data
        const response = await apiClient.get<{ slots: AvailableSlot[] }>('/bookings/available-slots', {
            params: { date },
        });
        return response.data.slots;
    },

    createBooking: async (data: CreateBookingRequest): Promise<Booking> => {
        // Interceptor unwraps { success, data: booking } to just booking in response.data
        const response = await apiClient.post<Booking>('/bookings', data);
        return response.data;
    },

    getMyBookings: async (): Promise<Booking[]> => {
        // Backend returns { bookings: [...] }, interceptor unwraps it to response.data
        const response = await apiClient.get<{ bookings: Booking[] }>('/bookings/me');
        return response.data.bookings;
    },

    // ================================
    //  Admin / Owner
    // ================================
    getOwnerBookings: async (params?: {
        date?: string;
        status?: BookingStatus;
    }): Promise<Booking[]> => {
        // GET /api/bookings/owner/bookings
        const response = await apiClient.get<{ bookings: Booking[] }>(
            '/bookings/owner/bookings',
            { params }
        );
        return response.data.bookings;
    },

    updateBookingStatus: async (
        bookingId: string,
        status: BookingStatus
    ): Promise<Booking> => {
        // PATCH /api/bookings/:id/status
        const response = await apiClient.patch<{ booking: Booking }>(
            `/bookings/${bookingId}/status`,
            { status }
        );
        return response.data.booking;
    },

    getServices: async (): Promise<Service[]> => {
        // Try to get services from API, fallback to hardcoded
        try {
            const response = await apiClient.get<{ services: Service[] }>('/bookings/services');
            return response.data.services;
        } catch {
            // Return hardcoded services if endpoint doesn't exist
            return [
                {
                    id: 'service-1',
                    name: 'Corte de cabello',
                    description: 'Corte clásico de cabello',
                    durationMin: 35,
                    price: 20,
                    active: true,
                },
            ];
        }
    },

    getOwnerBlocks: async (date: string): Promise<any[]> => {
        const response = await apiClient.get<{ blocks: any[] }>('/bookings/blocks', { params: { date } });
        return response.data.blocks;
    },

    createOwnerBlock: async (data: { date: string; startTime?: string; endTime?: string; reason?: string; fullDay?: boolean }) => {
        const response = await apiClient.post('/bookings/blocks', data);
        return response.data;
    },

    deleteOwnerBlock: async (id: string) => {
        const response = await apiClient.delete(`/bookings/blocks/${id}`);
        return response.data;
    }
};

export default bookingsApi;
