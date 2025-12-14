// Types for the barbershop application

export type UserRole = 'CLIENT' | 'OWNER';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type NotificationChannel = 'WHATSAPP' | 'SMS' | 'EMAIL';

export interface Barbershop {
    id: string;
    name: string;
    phone?: string;
    address?: string;
    city?: string;
    description?: string;
    openTime: string;
    closeTime: string;
    slotMinutes: number;
    logoUrl?: string;
    currency: string;
    bookingPolicy?: string;
    timeZone: string;
}

export interface User {
    id: string;
    fullName: string;
    username: string;
    email: string;              // NUEVO: Obligatorio
    phone?: string | null;      // Ahora opcional
    role: UserRole;
    emailVerified: boolean;     // NUEVO: Verificación principal (obligatoria para reservas)
    phoneVerified: boolean;     // Opcional - ya no bloquea reservas

    // Profile fields
    avatarUrl?: string;
    gender?: Gender;
    birthDate?: string; // ISO string
    notificationChannel?: NotificationChannel;
    marketingOptIn?: boolean;
    language?: string;

    barbershop?: Barbershop;

    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Service {
    id: string;
    name: string;
    description?: string;
    durationMin: number;
    price: number;
    active: boolean;
}

export interface Booking {
    id: string;
    clientId: string;
    serviceId: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    client?: User;
    service?: Service;
}

export interface AvailableSlot {
    startTime: string;
    endTime: string;
}

export interface OwnerSchedule {
    id: string;
    weekday: number;
    startTime: string;
    endTime: string;
    active: boolean;
}

export interface DisabledSlot {
    id: string;
    startTime: string;
    endTime: string;
    reason?: string;
    createdAt: string;
}

export interface ApiError {
    message: string;
    statusCode?: number;
}
