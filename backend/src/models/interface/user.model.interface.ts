import { Document } from "mongoose";

export interface IUserModel extends Document{
    firstName: String;
    lastName: String;
    email: String;
    password: String;
}