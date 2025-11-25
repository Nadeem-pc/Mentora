import { ITherapistRepository } from "@/repositories/interface/ITherapistRepository";
import { ITherapistProfileService } from "../interface/IProfileService";
import { getObjectURL, putObjectURl } from "@/config/s3Bucket.config";
import { createHttpError } from "@/utils/http-error.util";
import { HttpStatus } from "@/constants/status.constant";
import { HttpResponse } from "@/constants/response-message.constant";
import { ITherapistModel } from "@/models/interface/therapist.model.interface";
import logger from "@/config/logger.config";

export class TherapistProfileService implements ITherapistProfileService {
    constructor(private readonly _therapistRepository: ITherapistRepository) {}

    getTherapistProfile = async (therapistId: string): Promise<ITherapistModel | null> => {
        return await this._therapistRepository.findTherapistById(therapistId);
    };

    updateProfile = async (
        therapistId: string, 
        updateData: Partial<ITherapistModel>
    ): Promise<{ success: boolean, message: string }> => {
        try {
            if (!therapistId) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.INVALID_ID);
            }

            const currentTherapist = await this._therapistRepository.findTherapistById(therapistId);
            
            if (!currentTherapist) {
                throw createHttpError(HttpStatus.NOT_FOUND, 'Therapist not found');
            }

            const cleanedData = Object.entries(updateData).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);

            if (Object.keys(cleanedData).length === 0) {
                throw createHttpError(
                    HttpStatus.BAD_REQUEST,
                    'No valid data to update'
                );
            }

            const currentApprovalStatus = currentTherapist.approvalStatus?.toLowerCase();
            
            if (currentApprovalStatus !== 'approved') {
                cleanedData.approvalStatus = 'Requested';
            }

            const result = await this._therapistRepository.updateTherapistProfile(
                therapistId, 
                cleanedData,
            );

            if (!result) {
                throw createHttpError(
                    HttpStatus.NOT_FOUND,
                    'Therapist not found or update failed'
                );
            }

            return { success: true, message: HttpResponse.PROFILE_UPDATED };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };

    generatePresignedUploadUrl = async (
        fileName: string, 
        fileType: string
    ): Promise<{ uploadURL: string; fileURL: string }> => {
        try {
            const { uploadURL, fileURL } = await putObjectURl(fileName, fileType);
            if (!uploadURL || !fileURL) {
                throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.SERVER_ERROR);
            }
            return { uploadURL, fileURL };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };

    generatePresignedGetUrl = async (fileName: string): Promise<string> => {
        try {
            const getURL = await getObjectURL(fileName);
            if (!getURL) {
                throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.SERVER_ERROR);
            }
            return getURL;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };

    getApprovalStatus = async (therapistId: string): Promise<string> => {
        try {
            if (!therapistId) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.INVALID_ID);
            }

            const therapist = await this._therapistRepository.findTherapistById(therapistId);
            
            if (!therapist) {
                throw createHttpError(HttpStatus.NOT_FOUND, 'Therapist not found');
            }

            return therapist.approvalStatus || 'pending';
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };

}