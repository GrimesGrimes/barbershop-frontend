import apiClient from './client';
import type { Booking } from './types';

export interface StatsSummary {
    totalBookings: number;
    completedBookings: number;
    pendingBookings: number;
    revenue: number;
}

export interface TodayStats {
    date: string;
    bookings: number;
    completed: number;
    revenue: number;
    nextBookings: Booking[];
}

export interface RevenueByDay {
    date: string;
    revenue: number;
}

export interface ServiceStats {
    serviceName: string;
    count: number;
    revenue: number;
}

export interface OwnerStatsResponse {
    summary: StatsSummary;
    today: TodayStats;
    revenueByDay: RevenueByDay[];
    bookingsByService: ServiceStats[];
}

const statsApi = {
    getStats: async (from?: string, to?: string): Promise<OwnerStatsResponse> => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);

        const response = await apiClient.get(`/stats?${params.toString()}`);
        return response.data;
    },
};

export default statsApi;
