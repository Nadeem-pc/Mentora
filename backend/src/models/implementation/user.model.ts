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
    status: {
        type: String, 
        enum: ["Active", "Blocked"],
        default: "Active"
    },
});

const User = model<IUserModel>("User", userSchema);
export default User;