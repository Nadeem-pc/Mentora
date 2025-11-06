import { IUserRepository } from "@/repositories/interface/IUserRepository";
import { IAppointmentRepository } from "@/repositories/interface/IAppointmentRepository";
import { IClientProfileService } from "../interface/IProfileService";
import { IUserModel } from "@/models/interface/user.model.interface";
import { IAppointment } from "@/models/interface/appointment.model.interface";
import { HttpResponse } from "@/constants/response-message.constant";
import { getObjectURL, putObjectURl } from "@/config/s3Bucket.config";
import { HttpStatus } from "@/constants/status.constant";
import { createHttpError } from "@/utils/http-error.util";
import logger from "@/config/logger.config";

export class ClientProfileService implements IClientProfileService {
    private readonly _clientRepository: IUserRepository;
    private readonly _appointmentRepository?: IAppointmentRepository;

    constructor(
        clientRepository: IUserRepository,
        appointmentRepository?: IAppointmentRepository
    ) {
        this._clientRepository = clientRepository;
        this._appointmentRepository = appointmentRepository;
    }

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

    getClientAppointments = async (
        clientId: string, 
        status?: string,
        skip?: number,
        limit?: number
    ): Promise<IAppointment[]> => {
        try {
            if (!this._appointmentRepository) {
                throw createHttpError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Appointment repository not initialized"
                );
            }

            let appointments: IAppointment[];

            if (status === 'upcoming') {
                appointments = await this._appointmentRepository.findUpcomingAppointments(clientId, 'client');
            } else if (status === 'past') {
                appointments = await this._appointmentRepository.findPastAppointments(clientId, 'client');
            } else {
                appointments = await this._appointmentRepository.findByClientId(clientId, skip, limit);
            }

            return appointments;
        } catch (error) {
            logger.error("Error fetching client appointments:", error);
            throw error;
        }
    };
}