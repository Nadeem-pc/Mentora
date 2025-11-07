import { axiosInstance } from "@/config/axios.config";
import { API } from "@/constants/api.constant";
import type { UserDetail } from "@/types/dtos/user.dto";


export const getUsers = async (search: string, page: number, limit: number, filter: string = 'all') => {
  const response = await axiosInstance.get(API.ADMIN.GET_USERS, {
    params: { search, page, limit, filter }
  });
  return response.data;
};

export const getUserDetails = async (userId: string): Promise<UserDetail> => {
  try {
    const response = await axiosInstance.get(API.ADMIN.GET_USER_DETAILS(userId), { withCredentials: true });
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user details');
  }
};

export const blockUser = async (userId: string): Promise<boolean> => {
  try {
    await axiosInstance.patch(API.ADMIN.BLOCK_USER(userId));
    return true;
  } catch (error) {
    console.error("Error blocking user:", error?.response?.data?.message || error.message);
    return false;
  } 
};

export const unblockUser = async (userId: string): Promise<boolean> => {
  try {
    await axiosInstance.patch(API.ADMIN.UNBLOCK_USER(userId));
    return true;
  } catch (error) {
    console.error("Error unblocking user:", error?.response?.data?.message || error.message);
    return false;
  }
};