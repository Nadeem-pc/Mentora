import { axiosInstance } from "@/config/axios.config";
import { API } from "@/constants/api.constant";

export const clientTherapistService = {
    getTherapists: async () => {
        try {
            const response = await axiosInstance.get(API.CLIENT.GET_THERAPISTS_LIST);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    getTherapistDetails: async (therapistId: string) => {
        try {
            const response = await axiosInstance.get(API.CLIENT.GET_THERAPIST_DETAILS(therapistId));
            return response.data;
        } catch (error){
            console.error(error);
            throw error;
        }
    },

    getTherapistWeeklySchedule: async (therapistId: string) => {
        try {
            const response = await axiosInstance.get(API.CLIENT.GET_THERAPIST_SLOTS(therapistId));
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    getAvailableSlotsForDate: async (therapistId: string, date: string) => {
        try {
            const response = await axiosInstance.get(
                API.CLIENT.GET_AVAILABLE_SLOTS_FOR_DATE(therapistId, date)
            );
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    getTherapistReviews: async (therapistId: string) => {
        try {
            const response = await axiosInstance.get(
                API.CLIENT.GET_THERAPIST_REVIEWS(therapistId)
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching therapist reviews:', error);
            throw error;
        }
    }
};