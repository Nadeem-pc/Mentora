import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getEnvVar = (key: string, required = true): string | undefined => {
    const value = process.env[key];
    if (!value && required) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const env = {
    NODE_ENV: getEnvVar('NODE_ENV', false),
    PORT: getEnvVar('PORT'),
    MONGODB_URI: getEnvVar('MONGODB_URI'),
    REDIS_URI: getEnvVar('REDIS_URI'),
    JWT_ACCESS_SECRET: getEnvVar('JWT_ACCESS_SECRET'),
    JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET'),
    SENDER_EMAIL: getEnvVar('SENDER_EMAIL'),
    PASSKEY: getEnvVar('PASSKEY'),
    
};