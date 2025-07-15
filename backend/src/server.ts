import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { env } from './config/env.config';
import connectDb from './config/mongo.config'
import { connectRedis } from './config/redis.config';

connectDb();
connectRedis();
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.listen(env.PORT, () => {
    console.log(`Server is running on PORT ${env.PORT}...`);
});