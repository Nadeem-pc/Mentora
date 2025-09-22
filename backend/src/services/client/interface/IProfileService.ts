import { IUserModel } from "@/models/interface/user.model.interface";

export interface IClientProfileService {
    getClientData(clientId: string): Promise<IUserModel | null>;
    updateProfile(clientId: string, updateData: string): Promise<{ success:boolean, message:string }>;
    updateProfileImage(clientId: string, fileKey: string): Promise<{ imageUrl: string }>;
    generatePresignedUploadUrl(fileName: string, fileType: string): Promise<{ uploadURL: string; fileURL: string }>;
    generatePresignedGetUrl(fileName: string): Promise<string>;
};