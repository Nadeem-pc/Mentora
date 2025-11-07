import { axiosInstance } from "@/config/axios.config";
import { API } from "@/constants/api.constant";

interface ProfilePayload {
    gender?: string;
    phone?: string;
    experience?: string;
    fee?: string; 
    qualification?: string;
    specializations?: string[];
    languages?: string[];
    about?: string;
    profileImg?: string; 
    resume?: string;
    certifications?: string[]; 
}

export const therapistProfileService = {
    getProfile: async () => {
        try {
            const { data } = await axiosInstance.get(API.THERAPIST.GET_THERAPIST_PROFILE);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    
    updateProfile: async (payload: ProfilePayload) => {
        try {
            const { data } = await axiosInstance.patch(
                API.THERAPIST.UPDATE_THERAPIST_PROFILE, 
                payload,
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },
};