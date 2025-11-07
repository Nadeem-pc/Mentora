import { createHttpError } from "@/utils/http-error.util";
import { IAuthService } from "../interface/IAuthService";
import { HttpStatus } from "@/constants/status.constant";
import { HttpResponse } from "@/constants/response-message.constant";
import { generateOTP } from "@/utils/generate-otp.util";
import { redisClient } from "@/config/redis.config";
import { sendOtpEmail, sendResetPasswordEmail } from "@/utils/send-email.utils";
import { IUser } from "@/types";
import { IUserRepository } from "@/repositories/interface/IUserRepository";
import { IUserModel } from "@/models/interface/user.model.interface";
import { comparePassword, hashPassword } from "@/utils/bcrypt.util";
import { AuthJwtPayload } from "@/types/jwt-payload";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "@/utils/jwt.util";
import { generateNanoId } from "@/utils/generate-nanoid.util";
import logger from "@/config/logger.config";
import { env } from "@/config/env.config";
import fetchGoogleUser from "@/utils/google-auth.util";


export class AuthService implements IAuthService {
    constructor(private readonly _userRepository: IUserRepository){};

    registerUser = async (user:IUser): Promise<{ success: boolean; message: string; }> =>{
        const userExist = await this._userRepository.findByEmail(user.email); 
        if(userExist){
            throw createHttpError(HttpStatus.CONFLICT, HttpResponse.USER_EXIST);
        }
        const otp = generateOTP();
        logger.info(`OTP: ${otp}`);
        await sendOtpEmail(user.email, otp);

        const response = await redisClient.setEx(
            user.email,
            Number(env.OTP_EXPIRY_SECONDS),
            JSON.stringify({...user, otp})
        );

        if(!response) throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.SERVER_ERROR);

        return { success: true, message: "Otp send to your email" };
    };

    verifyOtp = async (email:string, otp:string): Promise<{ user: IUserModel, accessToken: string, refreshToken: string }> => {
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
            role: storedData.role,
            email: storedData.email,
            password: hashedPassword
        };

        const createdUser = await this._userRepository.createUser(user as IUserModel);
        if(!createdUser){
            throw createHttpError(HttpStatus.CONFLICT, HttpResponse.USER_CREATION_FAILED);
        }

        await redisClient.del(email);

        const payload = { id: createdUser._id, role: user.role, email: createdUser.email } as AuthJwtPayload;

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        return { user: createdUser, accessToken, refreshToken }
    };

    resendOtp = async (email: string): Promise<{ success: boolean, message: string }> => {
        const storedDataString = await redisClient.get(email);
        if(!storedDataString) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.OTP_NOT_FOUND);

        const storedData = JSON.parse(storedDataString);
        const newOtp = generateOTP();
        logger.info(`NEW OTP: ${newOtp}`);
        
        await sendOtpEmail(email, newOtp);
        
        const updateData = { ...storedData, otp: newOtp };
        await redisClient.setEx(
            email,
            Number(env.OTP_EXPIRY_SECONDS),
            JSON.stringify(updateData)
        );
        return { success: true, message: "OTP resent successfully" };
    };

    login = async (email: string, password: string): Promise<{ accessToken: string, refreshToken: string, user: IUserModel }> => {
        const user = await this._userRepository.findByEmail(email);
        if(!user){
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        }

        if(user.status === 'Blocked'){
            throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.USER_ACCOUNT_BLOCKED);
        }

        const match = await comparePassword(password, user.password as string);
        if(!match){
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.PASSWORD_INCORRECT);
        }

        const payload = { id: user._id, role: user.role, email: user.email } as AuthJwtPayload;

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        return { accessToken, refreshToken, user };
    };

    googleAuth = async (token: string, role: string): Promise<{ accessToken: string, refreshToken: string, user: IUserModel }> => {
        const googleUser = await fetchGoogleUser(token);

        if(!googleUser) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
        }
        const userExist = await this._userRepository.findByEmail(googleUser.email);

        if(userExist) {
            if(userExist.status === 'Blocked'){
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.USER_ACCOUNT_BLOCKED);
            }

            const payload = { id: userExist._id, role: userExist.role, email: googleUser.email } as AuthJwtPayload;
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            return { accessToken, refreshToken, user: userExist };
        }

        const newUser = {
            firstName: googleUser.given_name || googleUser.name?.split(' ')[0] || 'Client',
            lastName: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || '',
            email: googleUser.email,
            password: await hashPassword(generateNanoId()), 
            role, 
        };

        const createdUser = await this._userRepository.createUser(newUser as IUserModel);

        if (!createdUser) {
            throw createHttpError(HttpStatus.CONFLICT, HttpResponse.USER_CREATION_FAILED);
        }

        const payload = { id: createdUser._id, role: createdUser.role, email: createdUser.email } as AuthJwtPayload;

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        return { user: createdUser, accessToken, refreshToken };
    };

    forgotPassword = async (email:string): Promise<{ success: boolean, message: string}> => {
        const userExist = await this._userRepository.findByEmail(email);
        if(!userExist) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        }
        const token = generateNanoId();
        const storeOnReddis = await redisClient.setEx(token, Number(env.RESET_PASSWORD_TOKEN_EXPIRY_SECONDS), email);

        if (!storeOnReddis) {
            throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.SERVER_ERROR);
        }
        await sendResetPasswordEmail(email, token);

        return { success: true, message: HttpResponse.RESET_PASS_LINK };
    };

    resetPassword = async (password: string, token: string): Promise<{ success: boolean, message: string }> => {
        const email = await redisClient.get(token);
        if(!email) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.TOKEN_EXPIRED);
        }

        const hashedPassword = await hashPassword(password);
        const updatedClient = await this._userRepository.updatePassword(email, hashedPassword);

        if(!updatedClient){
            throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.SERVER_ERROR);
        }

        await redisClient.del(token);
        return { success: true, message: HttpResponse.PASSWORD_CHANGE_SUCCESS };
    };

    refreshAccessToken = async (token: string) => {
        if(!token){
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.NO_TOKEN);
        }

        const decoded = verifyRefreshToken(token) as AuthJwtPayload;
        if(!decoded){
            throw createHttpError(HttpStatus.NO_CONTENT, HttpResponse.TOKEN_EXPIRED);
        }

        const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role, email: decoded.email });
        const refreshToken = generateRefreshToken({ id: decoded.id, role: decoded.role, email: decoded.email });

        return { accessToken, refreshToken };
    };

    getClient = async (clientId: string): Promise<IUserModel> => {
        const user = await this._userRepository.findUserById(clientId);
        if (!user) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND)
        }
        return user;
    };
};