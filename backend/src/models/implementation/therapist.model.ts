import { Schema } from "mongoose";
import { ITherapistModel } from "../interface/therapist.model.interface";
import User from "./user.model";

const therapistSchema = new Schema<ITherapistModel>({
    experience: {
        type: String,
        default: null
    },
    fee: {
        type: String,
        default: null
    },
    qualification: {
        type: String,
        default: null
    },
    specializations: {
        type: [String],
        default: []
    },
    languages: {
        type: [String],
        default: []
    },
    about: {
        type: String,
        default: null
    },
    resume: {
        type: String,
        default: null
    },
    certifications: {
        type: [String],
        default: []
    },
    approvalStatus: {
        type: String,
        enum: ['Pending', 'Requested', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    rejectionReason: {
        type: String
    }
}, { timestamps: true });

export const TherapistDetails = User.discriminator<ITherapistModel>("therapist", therapistSchema);