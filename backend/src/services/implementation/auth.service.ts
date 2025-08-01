import { createHttpError } from "@/utils/http-error.util";
import { IAuthService } from "../interface/IAuthService";
import { HttpStatus } from "@/constants/status.constant";
import { HttpResponse } from "@/middlewares/response-message.constant";
import { generateOTP } from "@/utils/generate-otp.util";
import { redisClient } from "@/config/redis.config";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "@/utils/jwt.util";
import { sendOtpEmail } from "@/utils/send-email.utils";
import { comparePassword } from "@/utils/bcrypt.util";
import { AuthJwtPayload } from "@/types/jwt-payload";
import { IUser } from "@/types";
import { IUserRepository } from "@/repositories/interface/IUserRepository";

export class AuthService implements IAuthService {
    constructor(private readonly userRepository: IUserRepository){ }

    async register(user: IUser): Promise<string> {
        const userExist = await this.userRepository.findByEmail(user.email);
        if(userExist){
            throw createHttpError(HttpStatus.CONFLICT, HttpResponse.USER_EXIST);
        }
        const otp = generateOTP();
        await sendOtpEmail(user.email, otp);
        const response = await redisClient.setEx(
            user.email,
            300,
            JSON.stringify({...user, otp})
        );

        if(!response){
            throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.SERVER_ERROR);
        }

        return user.email
    }

    async login(identifier: string, password: string): Promise<{ accessToken: string; refreshToken: string}> {
        const user = await this.userRepository.findByEmail(identifier);
        if(!user){
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        }

        const isMatch = await comparePassword(password, user.password as string);

        if(!isMatch){
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.PASSWORD_INCORRECT);
        }

        const payload = { id: user._id, role: user.role } as AuthJwtPayload;
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        
        return { accessToken, refreshToken };
    }

    async refreshAccessToken(token: string) {
        console.log("Token: ",token)
        if(!token){
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.NO_TOKEN);
        }
        const decoded = verifyRefreshToken(token) as AuthJwtPayload;

        if(!decoded){
            throw createHttpError(HttpStatus.NO_CONTENT, HttpResponse.TOKEN_EXPIRED);
        }

        const accessToken = generateAccessToken({ _id: decoded.id, role: decoded.role, email: decoded.email });
        const refreshToken = generateRefreshToken({ _id: decoded.id, role: decoded.role, email: decoded.email });

        return { accessToken, refreshToken };
    }
}