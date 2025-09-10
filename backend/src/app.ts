import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.router';
import { errorHandler } from './middlewares/error-handler.middleware';

export const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

app.use('/auth', authRouter);

app.use(errorHandler);