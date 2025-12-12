import { ITherapistModel } from "@/models/interface/therapist.model.interface";

export interface ITherapistProfileService {
    getTherapistProfile(clientId: string): Promise<ITherapistModel | null>;
    updateProfile(therapistId: string, updateData: string): Promise<{ success:boolean, message:string }>;
    generatePresignedUploadUrl(fileName: string, fileType: string): Promise<{ uploadURL: string; fileURL: string }>;
    generatePresignedGetUrl(fileName: string): Promise<string>;
    getApprovalStatus(therapistId: string): Promise<string>;
};