import { createClient, RedisClientType } from "redis"
import { env } from './env.config';
import logger from "./logger.config";

let redisClient: RedisClientType;

async function connectRedis() {
    try {
        redisClient = createClient({
            url: env.REDIS_URI,
            socket: {
                reconnectStrategy(retries) {
                    if (retries > 5) {
                        logger.error("Max Redis reconnect attempts reached.");
                        return false;
                    }
                    return Math.min(retries * 100, 2000);
                },
            },
        });
    
        redisClient.on("connect", () => {
            logger.info("Connected to Redis 🚩");
        });
    
        redisClient.on("error", (err) => {
            logger.error("Redis connection error:", err);
        });
    
        await redisClient.connect();
    } catch (error) {
        logger.error(error)
    }
}

export { connectRedis, redisClient };