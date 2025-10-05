import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/shared/auth.router';
import { errorHandler } from './middlewares/error-handler.middleware';
import adminRouter from './routes/admin/index.router';
import clientRouter from './routes/client/index.router';
import therapistRouter from './routes/therapist/index.router';

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
app.use('/admin', adminRouter);
app.use('/client', clientRouter);
app.use('/therapist', therapistRouter);

app.use(errorHandler);