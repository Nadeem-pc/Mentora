import { IUserRepository } from "@/repositories/interface/IUserRepository";
import { IClientProfileService } from "../interface/IProfileService";
import { IUserModel } from "@/models/interface/user.model.interface";
import { HttpResponse } from "@/constants/response-message.constant";
import { getObjectURL, putObjectURl } from "@/config/s3Bucket.config";
import { HttpStatus } from "@/constants/status.constant";
import { createHttpError } from "@/utils/http-error.util";
import logger from "@/config/logger.config";

export class ClientProfileService implements IClientProfileService {
    constructor(private readonly _clientRepository: IUserRepository) {}

    getClientData = async (clientId: string): Promise<IUserModel | null> => {
        return await this._clientRepository.findUserById(clientId);
    };

    updateProfile = async (clientId: string, updateData: Partial<IUserModel>): Promise<{ success: boolean, message: string }> => {
        await this._clientRepository.updateUserById(clientId, updateData);
        return { success: true, message: HttpResponse.PROFILE_UPDATED };
    };

    generatePresignedUploadUrl = async (fileName: string, fileType: string): Promise<{ uploadURL: string; fileURL: string }> => {
        const { uploadURL, fileURL } = await putObjectURl(fileName, fileType);
        if (!uploadURL || !fileURL) {
            throw createHttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                HttpResponse.SERVER_ERROR,
            );
        }
        return { uploadURL, fileURL };
    };

    generatePresignedGetUrl = async (fileName: string): Promise<string> => {
        const getURL = await getObjectURL(fileName);
        if (!getURL) {
            throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.SERVER_ERROR);
        }
        return getURL;
    };

    updateProfileImage = async (clientId: string, fileKey: string): Promise<{ imageUrl: string }> => {
        try {
            let cleanKey = fileKey;
            if (fileKey.startsWith('http')) {
                const urlParts = fileKey.split('/');
                cleanKey = urlParts.slice(-2).join('/'); 
            }

            const imageUrl = await this.generatePresignedGetUrl(cleanKey);
            
            await this._clientRepository.updateUserById(clientId, { 
                profileImg: cleanKey 
            });

            return { imageUrl };
        } catch (error) {
            logger.error("Error in updateProfileImage service:", error);
            throw new Error("Failed to update profile image");
        }
    };
}