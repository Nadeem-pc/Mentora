import { Document } from "mongoose";

export interface IUserModel extends Document{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    phone: string | null;
    gender: string | null;
    dob: string | null;
    profileImg?: string | null;     
    status: string;
}