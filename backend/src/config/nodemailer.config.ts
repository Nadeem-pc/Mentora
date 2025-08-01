import nodemailer from 'nodemailer';
import { env } from './env.config';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.SENDER_EMAIL,
        pass: env.PASSKEY
    },
    // tls: {
    //     rejectUnauthorized: false
    // }
});