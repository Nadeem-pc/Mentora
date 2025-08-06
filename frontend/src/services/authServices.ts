import { authInstance } from "@/config/axios.config";

interface OtpData {
  email: string;
  otp: string;
}

export const AuthService = {
  login: async (email: string, password: string) => {
    const response = await authInstance.post("/login", { email, password });
    return response.data;
  },

  register: async (firstName: string, lastName: string, email: string, password: string) => {
    const response = await authInstance.post("/register", {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  },

  verifyOtp: async (data: OtpData) => {
    try {
      const response = await authInstance.post("/verify-otp", data );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  resendOtp: async (email: string) => {
    try {
      const response = await authInstance.post("/resend-otp", { email });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // refreshToken: async () => {
  //   // try {
  //     const response = await authInstance.post("/refresh-token", {})
  //     return response.data
  //   // } catch (error) {
  //   //   return error
  //   // }
  // }
};
