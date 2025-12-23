export type Role = 'admin' | 'public_user';

export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
    created_at: string;
}

export interface Appointment {
    id: string;
    doctor_id: string;
    user_id: string;
    token_number: number;
    status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    appointment_date: string;
    created_at: string;
    patient_name?: string;
    patient_phone?: string;
    doctors?: Doctor; // Joined data
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    created_at: string;
}
