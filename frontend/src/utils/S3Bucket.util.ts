import axios from "axios";
import { API } from "@/constants/api.constant";
import { axiosInstance } from "@/config/axios.config";

export const S3BucketUtil = {
  putPreSignedURL: async (file: File) => {
    try {
      const response = await axiosInstance.get(API.CLIENT.PUT_PRESIGNED_URL, {
        params: {
          fileName: file.name,
          type: file.type,
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  },
  getPreSignedURL: async (fileName: string) => {
    try {
      const response = await axiosInstance.get(API.CLIENT.GET_PRESIGNED_URL, {
        params: { key: fileName },
      });
      return response.data.get_fileURL;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  },
  uploadToS3: async (uploadURL: string, file: File) => {
    try {
      await axios.put(uploadURL, file, {
        headers: { "Content-Type": file.type },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  },
};