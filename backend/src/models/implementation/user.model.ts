import { model, Schema } from "mongoose";
import { IUserModel } from "../interface/user.model.interface";

const userSchema = new Schema<IUserModel>({
    firstName: {
        type: String, 
        required: true
    },
    lastName: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }, 
    password: {
        type: String
    },
    role: {
        type: String, 
        enum: ["client", "therapist", "admin"],
        default: "client"
    },
    phone: {
        type: String,
        default: null 
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: null 
    },
    dob: {
        type: String,
    },
    profileImg: { 
        type: String, 
        default: null 
    },     
    status: {
        type: String, 
        enum: ["Active", "Blocked"],
        default: "Active"
    },
}, { timestamps: true,  discriminatorKey: 'role' });

const User = model<IUserModel>("User", userSchema);
export default User;