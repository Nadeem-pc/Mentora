import { env } from '@/config/env.config';
import bcrypt from 'bcrypt';

export async function hashPassword(password:string): Promise<string> {
    return await bcrypt.hash(password, Number(env.BCRYPT_SALT_ROUNDS));
};

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
};