import { authInstance } from "@/config/axios.config";

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

  refreshToken: async () => {
    // try {
      const response = await authInstance.post("/refresh-token", {})
      return response.data
    // } catch (error) {
    //   return error
    // }
  }
};
