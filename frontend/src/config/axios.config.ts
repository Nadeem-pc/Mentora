import { env } from './env.config';
import axios, {type AxiosInstance } from 'axios';

const createAxiosInstance = (): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: `${env.BACKEND_URL}`,
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/login') &&
      !originalRequest.url.includes('/refresh-token')
    ) {
      if (!localStorage.getItem("accessToken")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${env.BACKEND_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem('accessToken', refreshResponse.data.token);
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/form';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

  // axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 403 && error.response?.data?.reason === "Blocked") {
//       localStorage.removeItem("token");
//       window.location.href = "/blocked"; // redirect to blocked page
//     }
//     return Promise.reject(error);
//   }
// );

  return axiosInstance;
};

export const axiosInstance = createAxiosInstance();