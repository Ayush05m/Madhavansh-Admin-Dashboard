import { api } from "./axios"

export interface Slot {
    startTime: string
    endTime: string
    isBooked?: boolean
}

export interface ApiResponse {
    data: Doctor[]
    message: string
    status: string
}

export interface Availability {
    days: string[]
    slots: Slot[][]
    _id?: string
}

export interface Doctor {
    _id: string
    name: string
    email: string
    phone: string
    specialization: ('Ayurveda' | 'Panchakarma' | 'Yoga' | 'General')[]
    qualification: string
    experience: number
    registrationNumber: string
    availability: Availability
    status: 'active' | 'inactive' | 'on-leave'
    profileImage?: string
    createdAt?: string
    updatedAt?: string
    __v?: number
}

export type CreateDoctorDto = {
    name: string
    email: string
    phone: string
    specialization: ('Ayurveda' | 'Panchakarma' | 'Yoga' | 'General')[]
    qualification: string
    status: 'active' | 'inactive' | 'on-leave'
    experience: number
    registrationNumber: string
    availability: Availability
    profileImage?: string
}

export const doctorApi = {
    getAllDoctors: async (): Promise<ApiResponse> => {
        const response = await api.get('/doctors');
        return response.data;
    },

    getDoctorById: async (id: string): Promise<Doctor> => {
        const response = await api.get(`/doctors/${id}`);
        return response.data;
    },

    createDoctor: async (doctorData: CreateDoctorDto): Promise<Doctor> => {
        const response = await api.post('/doctors', doctorData);
        return response.data;
    },

    updateDoctorStatus: async (id: string, status: string): Promise<Doctor> => {
        const response = await api.patch(`/doctors/${id}/status`, { status });
        return response.data;
    },

    updateDoctorAvailability: async (
        id: string,
        availability: Doctor['availability']
    ): Promise<Doctor> => {
        const response = await api.patch(`/doctors/${id}/availability`, { availability });
        return response.data;
    },

    deleteDoctor: async (id: string): Promise<void> => {
        await api.delete(`/doctors/${id}`);
    },

    updateDoctor: async (id: string, data: CreateDoctorDto): Promise<Doctor> => {
        const response = await api.put(`/admin/doctors/${id}`, data);
        return response.data.data;
    }
}; 