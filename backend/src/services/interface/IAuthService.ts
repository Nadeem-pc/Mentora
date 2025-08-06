import { IUser } from "@/types";

export interface IAuthService {
    registerUser(user: IUser): Promise<{ success:boolean, message:string }>;
    verifyOtp(email: string, otp: string): Promise<{ success:boolean, message:string}>;
    resendOtp(email: string): Promise<{ success:boolean, message:string }>;
};