import { app } from "./app";
import { env } from "./config/env.config";
import http from 'http';

import connectDb from './config/mongo.config';
import { connectRedis } from './config/redis.config';

const connectServer = async () => {
    try {
        connectDb();
        connectRedis();

        const server = http.createServer(app);
        server.listen(env.PORT, () => {
            console.log(`Server is Running on PORT ${env.PORT}💡`);
        });
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

connectServer();