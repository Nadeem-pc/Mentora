import { Document } from "mongoose";

export interface ITherapistModel extends Document {
    id: string;
    experience: string;
    fee: string;
    qualification: string;
    specializations: [string];
    languages: [string];
    about: string;
    resume: string;
    certifications: [string];
    approvalStatus: string;
}