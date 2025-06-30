import mongoose from 'mongoose';
import { env } from './env';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        const dbURI = env.MONGODB_URI;
        if(!dbURI) {
            throw new Error("MONGODB_URI is not defined in .env");
        }
        await mongoose.connect(dbURI);
        console.log("Database connected successfully");
        
    } catch (error) {
        console.error("Database Connection Error", error);
    }
};

export default connectDB;