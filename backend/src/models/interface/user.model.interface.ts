import { Document } from "mongoose";

export interface IUserModel extends Document{
    id: string;
    firstName: String;
    lastName: String;
    email: String;
    password: String;
    role: string;
    status: String;
}