import { axiosInstance } from "@/config/axios.config";
import { API } from "@/constants/api.constant";

export const appointmentService = {
    getAppointments: async (page: number = 1, limit: number = 12, status?: string) => {
        try {
            const params: Record<string, string | number> = { page, limit };
            if (status && status !== 'all') {
                params.status = status;
            }
            
            const response = await axiosInstance.get(API.THERAPIST.GET_APPOINTMENTS, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
    },

    getAppointmentDetail: async (appointmentId: string) => {
        try {
            const response = await axiosInstance.get(API.THERAPIST.GET_APPOINTMENT_DETAIL(appointmentId));
            return response.data;

        } catch (error) {
            console.error('Error fetching appointment detail:', error);
            throw error;
        }
    },

    saveNotes: async (appointmentId: string, notes: string) => {
        try {
            const response = await axiosInstance.patch(API.THERAPIST.SAVE_APPOINTMENT_NOTES(appointmentId), {
                notes
            });

            return response.data;
        } catch (error) {
            console.error('Error saving counseling notes:', error);
            throw error;
        }
    },

    updateStatus: async (
        appointmentId: string,
        status: 'scheduled' | 'completed' | 'cancelled',
        cancelReason?: string
    ) => {
        try {
            const response = await axiosInstance.patch(
                API.THERAPIST.UPDATE_APPOINTMENT_STATUS(appointmentId),
                { status, cancelReason }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating appointment status:', error);
            throw error;
        }
    }
};