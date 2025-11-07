import { axiosInstance } from "@/config/axios.config";
import { API } from "@/constants/api.constant";
import type { ApplicationsResponseDTO, ApplicationDetailResponseDTO } from "@/types/dtos/job.dto";

interface ApplicationFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    specialization?: string;
    experienceRange?: string;
}

interface UpdateStatusPayload {
    status: 'Approved' | 'Rejected';
    reason?: string;
}

export const jobService = {
    getApplications: async (filters: ApplicationFilters = {}): Promise<ApplicationsResponseDTO> => {
        try {
            const params = new URLSearchParams();
            
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.search) params.append('search', filters.search);
            if (filters.status) params.append('status', filters.status);
            if (filters.specialization) params.append('specialization', filters.specialization);
            if (filters.experienceRange) params.append('experienceRange', filters.experienceRange);

            const response = await axiosInstance.get<ApplicationsResponseDTO>(
                `${API.ADMIN.GET_JOB_APPLICATIONS}?${params.toString()}`
            );
            
            return response.data;
        } catch (error) {
            console.error('Error fetching applications:', error);
            throw error;
        }
    },

    getApplicationDetails: async (applicationId: string): Promise<ApplicationDetailResponseDTO> => {
        try {
            const response = await axiosInstance.get<ApplicationDetailResponseDTO>(
                API.ADMIN.GET_JOB_APPLICATION_DETAILS(applicationId)
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching application details:', error);
            throw error;
        }
    },

    updateStatus: async (applicationId: string, payload: UpdateStatusPayload) => {
        try {
            const response = await axiosInstance.patch(
                `${API.ADMIN.UPDATE_APPLICATION_STATUS}/${applicationId}`,
                payload
            );
            
            return response.data;
        } catch (error) {
            console.error('Error updating application status:', error);
            throw error;
        }
    },
};