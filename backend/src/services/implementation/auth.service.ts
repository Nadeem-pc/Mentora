import { createHttpError } from "@/utils/http-error.util";
import { IAuthService } from "../interface/IAuthService";
import { HttpStatus } from "@/constants/status.constant";
import { HttpResponse } from "@/constants/response-message.constant";
import { generateOTP } from "@/utils/generate-otp.util";
import { redisClient } from "@/config/redis.config";
import { sendOtpEmail } from "@/utils/send-email.utils";
import { IUser } from "@/types";
import { IUserRepository } from "@/repositories/interface/IUserRepository";
import { IUserModel } from "@/models/interface/user.model.interface";
import { hashPassword } from "@/utils/bcrypt.util";


export class AuthService implements IAuthService {
    constructor(private readonly _userRepository: IUserRepository){};

    registerUser = async (user:IUser): Promise<{ success: boolean; message: string; }> =>{
        const userExist = await this._userRepository.findByEmail(user.email); 
        if(userExist){
            throw createHttpError(HttpStatus.CONFLICT, HttpResponse.USER_EXIST);
        }
        const otp = generateOTP();
        console.log("OTP: ", otp);
        await sendOtpEmail(user.email, otp);

        const response = await redisClient.setEx(
            user.email,
            300,
            JSON.stringify({...user, otp})
        );

        if(!response) throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.SERVER_ERROR);

        return { success: true, message: "Otp send to your email" };
    };

    verifyOtp = async (email:string, otp:string): Promise<{ success: boolean; message: string}> => {
        const storedDataString = await redisClient.get(email);
        if(!storedDataString) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.OTP_NOT_FOUND);

        const storedData = JSON.parse(storedDataString);
        if(storedData.otp !== otp) {
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.OTP_INCORRECT);
        }

        const hashedPassword = await hashPassword(storedData.password);

        const user = {
            firstName: storedData.firstName,
            lastName: storedData.lastName,
            email: storedData.email,
            password: hashedPassword
        };

        const createdUser = await this._userRepository.createUser(user as IUserModel);
        if(!createdUser){
            throw createHttpError(HttpStatus.CONFLICT, HttpResponse.USER_CREATION_FAILED);
        }

        await redisClient.del(email);
        return { success: true, message: "Registration successfull" };
    };

    resendOtp = async (email: string): Promise<{ success: boolean, message: string }> => {
        const storedDataString = await redisClient.get(email);
        if(!storedDataString) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.OTP_NOT_FOUND);

        const storedData = JSON.parse(storedDataString);
        const newOtp = generateOTP();
        console.log("New OTP: ", newOtp);
        
        await sendOtpEmail(email, newOtp);
        
        const updateData = { ...storedData, otp: newOtp };
        await redisClient.setEx(
            email,
            300,
            JSON.stringify(updateData)
        );
        return { success: true, message: "OTP resent successfully" };
    };
};