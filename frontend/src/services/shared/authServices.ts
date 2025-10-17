import { axiosInstance } from "@/config/axios.config";

interface OtpData {
  email: string;
  otp: string;
}

export const AuthService = {
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", response.data.token);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
    return response;
  },

  register: async (firstName: string, lastName: string, email: string, password: string, role: string) => {
    const response = await axiosInstance.post("/auth/register", {
      firstName,
      lastName,
      email,
      password,
      role
    });
    return response.data;
  },

  verifyOtp: async (data: OtpData) => {
    try {
      const response = await axiosInstance.post("/auth/verify-otp", data );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  forgotPassword: async (data: { email: string }) => {
    try {
      const response = await axiosInstance.post("/auth/forgot-password", data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  resetPassword: async (password: string, token: string | null) => {
    try {
      const response = await axiosInstance.post("/auth/reset-password", { password, token });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  resendOtp: async (email: string) => {
    try {
      const response = await axiosInstance.post("/auth/resend-otp", { email });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await axiosInstance.post("/auth/refresh-token", {}, { withCredentials: true });
      return response.data
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  fetchClient: async () => {
    try {
      const response = await axiosInstance.get("/auth/me", { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
