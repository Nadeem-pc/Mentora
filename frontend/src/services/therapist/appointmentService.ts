import { axiosInstance } from "@/config/axios.config";
import { API } from "@/constants/api.constant";

export const appointmentService = {
    getAppointments: async (page: number = 1, limit: number = 12, status?: string) => {
        try {
            const params = { page, limit };
            if (status && status !== 'all') {
                params.status = status;
            }
            
            const response = await axiosInstance.get(API.THERAPIST.GET_APPOINTMENTS, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
    }
};