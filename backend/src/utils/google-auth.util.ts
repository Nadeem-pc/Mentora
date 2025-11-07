import axios from 'axios';
import logger from '@/config/logger.config';
import { env } from '@/config/env.config';

interface GoogleUserInfo {
  role: string;
  name: string;
  given_name: string;
  family_name?: string;
  email: string;
}

const fetchGoogleUser = async (token: string): Promise<GoogleUserInfo | null> => {
    try {
        
        const response = await axios.get<GoogleUserInfo>(env.GOOGLE_USERINFO_URL as string, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: Number(env.GOOGLE_API_TIMEOUT), 
        });
        
        return response.data;
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            logger.error('Error fetching Google user details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
            });
        } else {
            logger.error('Unexpected error fetching Google user details:', error);
        }
        return null;
    }
};

export default fetchGoogleUser;