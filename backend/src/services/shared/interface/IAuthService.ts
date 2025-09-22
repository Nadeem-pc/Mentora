import { IUserModel } from "@/models/interface/user.model.interface";
import { IUser } from "@/types";

export interface IAuthService {
    registerUser(user: IUser): Promise<{ success:boolean, message:string }>;
    verifyOtp(otp: string, email: string): Promise<{ user: IUserModel, accessToken: string, refreshToken: string }>;
    resendOtp(email: string): Promise<{ success:boolean, message:string }>;
    login(email: string, password: string): Promise<{ accessToken:string, refreshToken:string, user: IUserModel }>;
    forgotPassword(email: string): Promise<{ success:boolean, message:string }>;
    resetPassword(password: string, token: string): Promise<{ success:boolean, message:string }>;
    refreshAccessToken(token: string): Promise<{ accessToken: string, refreshToken: string }>;
    getClient(clientId: string): Promise<IUserModel>;
};