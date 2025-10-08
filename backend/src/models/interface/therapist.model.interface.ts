import { IUserModel } from "./user.model.interface";

export interface ITherapistModel extends IUserModel {
    experience: string;
    fee: string;
    qualification: string;
    specializations: string[];
    languages: string[];
    about: string;
    resume: string;
    certifications: string[];
    approvalStatus: string;
    rejectionReason: string;
};