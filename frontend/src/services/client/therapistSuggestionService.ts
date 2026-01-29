import { axiosInstance } from "@/config/axios.config";
import { API } from "@/constants/api.constant";
import type { TherapistSuggestionResponse } from "@/types/dtos/therapist-suggestion.dto";
import type { ClientIntakeSubmission, BookingPreferences } from "@/types/dtos/intake-form.dto";

export const therapistSuggestionService = {
  getSuggestions: async (text: string): Promise<TherapistSuggestionResponse> => {
    try {
      const response = await axiosInstance.post(
        API.CLIENT.GET_THERAPIST_SUGGESTIONS,
        { text }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error getting therapist suggestions:", error);
      throw error;
    }
  },

  submitIntakeForm: async (submission: ClientIntakeSubmission): Promise<{ success: boolean }> => {
    try {
      const response = await axiosInstance.post(
        API.CLIENT.SUBMIT_INTAKE_FORM,
        submission
      );
      return response.data.data;
    } catch (error) {
      console.error("Error submitting intake form:", error);
      throw error;
    }
  },

  autoBookAppointment: async (
    therapistId: string,
    preferences: BookingPreferences
  ): Promise<{ appointmentId: string; dateTime: string; therapistId: string }> => {
    try {
      const response = await axiosInstance.post(
        API.CLIENT.AUTO_BOOK_APPOINTMENT,
        {
          therapistId,
          preferences,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error auto-booking appointment:", error);
      throw error;
    }
  },
};