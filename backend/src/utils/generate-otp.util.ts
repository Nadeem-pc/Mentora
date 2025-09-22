import { env } from '@/config/env.config';
import crypto from 'crypto';

export const generateOTP = () => {
    return crypto.randomInt(Number(env.OTP_START_INTERVAL), Number(env.OTP_END_INTERVAL)).toString();
};