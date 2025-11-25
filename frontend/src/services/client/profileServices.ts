import { axiosInstance } from "@/config/axios.config";
import { API } from "@/constants/api.constant";
import type { UserProfile } from "@/types/dtos/user.dto";
import { S3BucketUtil } from "@/utils/S3Bucket.util";

interface Appointment {
  _id: string;
  therapistId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImg?: string;
  };
  slotId: {
    _id: string;
    time: string;
    fees: number;
    consultationModes: string[];
  };
  appointmentDate: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const clientProfileService = {
  getProfileDetails: async () => {
    try {
      const { data } = await axiosInstance.get('/client/profile');
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateProfile: async (payload: Partial<UserProfile>) => {
    try {
      const { data } = await axiosInstance.patch('/client/profile', payload);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateProfileImg: async (profileImg: File) => {
    try {
      const { uploadURL, fileURL } = await S3BucketUtil.putPreSignedURL(profileImg);
      await S3BucketUtil.uploadToS3(uploadURL, profileImg);
      const { data } = await axiosInstance.patch('/client/profile-img', { 
        profileImg: fileURL 
      });
      return {
        success: data.success,
        message: data.message,
        imageUrl: data.imageUrl
      };
    } catch (error) {
      console.error('Error in updateProfileImg:', error);
      throw error;
    }
  },

  getAppointments: async (params?: { status?: string; page?: number; limit?: number }) => {
    try {
      const { data } = await axiosInstance.get('/client/appointments', { params });
      return data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  cancelAppointment: async (appointmentId: string, cancelReason: string) => {
    try {
      const { data } = await axiosInstance.patch(API.CLIENT.CANCEL_APPOINTMENT(appointmentId), {
        cancelReason
      });
      return data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },
};

export type { Appointment };