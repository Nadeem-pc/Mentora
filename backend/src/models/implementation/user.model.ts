import { hashPassword } from "@/utils/bcrypt.util";
import { model, Schema, Document } from "mongoose";

export interface IUserModel extends Document, Omit<IUserModel, "_id"> { }

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
    status: {
        type: String, 
        enum: ["Active", "Blocked"],
        default: "Active"
    },
    role: {
        type: String, 
        enum: ["User", "Therapist"],
        default: "User"
    },
    profilePicture: {
        type: String
    },
    dateOfBirth: {
        type: Date,
    },
});

userSchema.pre<IUserModel>("save", async function (next) {
    if(this.isModified("password")) {
        this.password = await hashPassword(this.password)
    }
    next()
})

const User = model<IUserModel>("User", userSchema);
export default User;