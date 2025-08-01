import { END_INTERVAL, START_INTERVAL } from '@/constants/otp-interval.constant';
import crypto from 'crypto';

export const generateOTP = () => {
    return crypto.randomInt(START_INTERVAL, END_INTERVAL).toString();
};