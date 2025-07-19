// import { createClient } from 'redis';
// import { env } from './env.config';

// const client = createClient({
//   url: env.REDIS_URI,
//   password: env.REDIS_PASSWORD
// });

// client.on('error', (err) => console.error('Redis Client Error', err));

// await client.connect();

// // Example set/get
// await client.set('foo', 'bar');
// const value = await client.get('foo');
// console.log(value); // 'bar'



import { createClient, RedisClientType } from "redis"
import { env } from './env.config';

let redisClient: RedisClientType;

async function connectRedis() {

    redisClient = createClient({
        url: env.REDIS_URI,
        socket: {
            reconnectStrategy(retries) {
                if (retries > 5) {
                console.error("Max Redis reconnect attempts reached.");
                return false;
                }
                return Math.min(retries * 100, 2000);
            },
        },
    });

    redisClient.on("connect", () => {
        console.log("Connected to Redis");
    });

    redisClient.on("error", (err) => {
        console.error("Redis connection error:", err);
    });

    await redisClient.connect();
}

export { connectRedis, redisClient };