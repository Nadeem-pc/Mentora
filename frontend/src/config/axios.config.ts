// import axios from 'axios';
// import { env } from './env.config';

// const createAxiosInstance = async (BASE_URL:string) => {
//     const axiosInstance = axios.create({
//         baseURL: BASE_URL,
//         withCredentials: true
//     });
//     return axiosInstance;
// };

// export const authInstance = await createAxiosInstance(`${env.BACKEND_URL}/auth`);

import axios, {type AxiosInstance } from 'axios';
import { env } from './env.config';

const createAxiosInstance = (BASE_URL: string): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });

  // Optional: Attach request/response interceptors
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
        !originalRequest.url.includes('/login')
      ) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await axios.post(
            `${env.BACKEND_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );
          localStorage.setItem('accessToken', refreshResponse.data.token);
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
          return axios(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export { createAxiosInstance };

export const authInstance = createAxiosInstance(`${env.BACKEND_URL}/auth`);
