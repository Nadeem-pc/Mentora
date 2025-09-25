import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/shared/auth.router';
import { errorHandler } from './middlewares/error-handler.middleware';
import clientProfileRouter from './routes/client/profile.router';
import userManagmentRouter from './routes/admin/user-management.router';
import therapistProfileRouter from './routes/therapist/profile.router';

export const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/admin', userManagmentRouter);
app.use('/client', clientProfileRouter);
app.use('/therapist', therapistProfileRouter);

app.use(errorHandler);