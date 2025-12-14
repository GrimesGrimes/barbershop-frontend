import apiClient from './client';
import type { Booking, OwnerSchedule, DisabledSlot } from './types';

export interface CreateDisabledSlotRequest {
    startTime: string;
    endTime: string;
    reason?: string;
}

export interface UpdateScheduleRequest {
    schedule: Array<{
        weekday: number;
        startTime: string;
        endTime: string;
        active: boolean;
    }>;
}

export const scheduleApi = {
    getBookingsByDate: async (date: string): Promise<Booking[]> => {
        // Backend returns { bookings: [...] }, interceptor unwraps to response.data
        const response = await apiClient.get<{ bookings: Booking[] }>('/schedule/bookings', {
            params: { date },
        });
        return response.data.bookings;
    },

    getDisabledSlots: async (): Promise<DisabledSlot[]> => {
        // Backend returns { disabledSlots: [...] }, interceptor unwraps to response.data
        const response = await apiClient.get<{ disabledSlots: DisabledSlot[] }>('/schedule/disabled-slots');
        return response.data.disabledSlots;
    },

    createDisabledSlot: async (data: CreateDisabledSlotRequest): Promise<DisabledSlot> => {
        // Backend returns disabledSlot directly, interceptor unwraps to response.data
        const response = await apiClient.post<DisabledSlot>('/schedule/disabled-slots', data);
        return response.data;
    },

    deleteDisabledSlot: async (id: string): Promise<void> => {
        await apiClient.delete(`/schedule/disabled-slots/${id}`);
    },

    getOwnerSchedule: async (): Promise<OwnerSchedule[]> => {
        // Backend returns { schedules: [...] }, interceptor unwraps to response.data
        const response = await apiClient.get<{ schedules: OwnerSchedule[] }>('/schedule/owner-schedule');
        return response.data.schedules;
    },

    updateOwnerSchedule: async (data: UpdateScheduleRequest): Promise<OwnerSchedule[]> => {
        // Backend returns schedule array directly, interceptor unwraps to response.data
        const response = await apiClient.put<OwnerSchedule[]>('/schedule/owner-schedule', data);
        return response.data;
    },
};

export default scheduleApi;
