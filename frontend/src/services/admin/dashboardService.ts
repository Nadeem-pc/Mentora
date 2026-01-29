import { axiosInstance } from "@/config/axios.config";
import { API } from "@/constants/api.constant";

export type AdminDashboardTimeframe = "week" | "month" | "year";

export type AdminDashboardResponse = {
  platformMetrics: {
    totalClients: number;
    totalTherapists: number;
    sessionsCompleted: number;
    revenuePeriod: number;
  };
  newSignupsData: Array<{ day: string; signups: number }>;
  issueData: Array<{ name: string; value: number }>;
  consultationModeData: Array<{ name: string; value: number }>;
  topTherapists: Array<{
    therapistId: string;
    name: string;
    rating: number | null;
    sessions: number;
    revenue: number;
  }>;
  averageRating: number | null;
};

export const adminDashboardService = {
  getDashboard: async (timeframe: AdminDashboardTimeframe): Promise<AdminDashboardResponse> => {
    const response = await axiosInstance.get(API.ADMIN.GET_DASHBOARD, {
      params: { timeframe },
    });

    return response.data.data as AdminDashboardResponse;
  },
};
