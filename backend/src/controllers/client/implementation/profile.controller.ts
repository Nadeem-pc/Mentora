import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "@/constants/status.constant";
import { IClientProfileService } from "@/services/client/interface/IProfileService";
import { IClientProfileController } from "../interface/IProfileController";
import logger from "@/config/logger.config";
import { HttpResponse } from "@/constants/response-message.constant";

export class ClientProfileController implements IClientProfileController {
    constructor(private readonly _clientProfileService: IClientProfileService) {}

    getClientData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const clientId = req.user?.id 
            const client = await this._clientProfileService.getClientData(clientId);
            res.status(HttpStatus.OK).json({ success: true, data: client });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const clientId = req.user?.id 
            await this._clientProfileService.updateProfile(clientId, req.body);
            res.status(HttpStatus.OK).json({ success: true, message: HttpResponse.PROFILE_UPDATED });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    preSignedURL = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { fileName, type } = req.query;
            
            if (!fileName || !type) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.FILENAME_OR_TYPE_MISSING
                });
            }

            const { uploadURL, fileURL } = await this._clientProfileService.generatePresignedUploadUrl(
                fileName as string,
                type as string,
            );
            
            res.status(HttpStatus.OK).json({ 
                success: true,
                message: HttpResponse.PRESIGNED_URL_GENERATED, 
                uploadURL, 
                fileURL 
            });

        } catch (error) {
            logger.error("Error generating presigned URL:", error);
            next(error);
        }
    };

    get_preSignedURL = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { key } = req.query;

            if (!key) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.KEY_MISSING
                });
            }

            const get_fileURL = await this._clientProfileService.generatePresignedGetUrl(
                key as string,
            );

            res.status(HttpStatus.OK).json({ 
                success: true,
                message: HttpResponse.GET_PRESIGNED_URL_GENERATED, 
                get_fileURL 
            });

        } catch (error) {
            logger.error("Error generating get presigned URL:", error);
            next(error);
        }
    };

    updateProfileImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const clientId = req.user?.id;
            const { profileImg } = req.body;
            
            if (!profileImg) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.KEY_MISSING
                });
            }

            const result = await this._clientProfileService.updateProfileImage(clientId, profileImg);

            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpResponse.PROFILE_PICTURE_CHANGED,
                imageUrl: result.imageUrl
            });
        } catch (error) {
            logger.error("Error updating profile image:", error);
            next(error);
        }
    };
    
    getClientAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const clientId = req.user?.id;
            const { status, page = 1, limit = 10 } = req.query;
            
            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            const appointments = await this._clientProfileService.getClientAppointments(
                clientId,
                status as string | undefined,
                skip,
                limitNum
            );

            res.status(HttpStatus.OK).json({ 
                success: true, 
                data: appointments,
                page: pageNum,
                limit: limitNum
            });
        } catch (error) {
            logger.error("Error fetching client appointments:", error);
            next(error);
        }
    };
};