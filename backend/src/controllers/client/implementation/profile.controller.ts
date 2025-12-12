import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "@/constants/status.constant";
import { IClientProfileService } from "@/services/client/interface/IProfileService";
import { IClientProfileController } from "../interface/IProfileController";
import logger from "@/config/logger.config";
import { HttpResponse } from "@/constants/response-message.constant";
import { AuthRequest } from "@/types/auth-request";

export class ClientProfileController implements IClientProfileController {
    constructor(private readonly _clientProfileService: IClientProfileService) {}

    getClientData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const clientId = (req as AuthRequest).user.id;
            const clientDTO = await this._clientProfileService.getClientData(clientId);
            
            if (!clientDTO) {
                res.status(HttpStatus.NOT_FOUND).json({ 
                    success: false, 
                    message: HttpResponse.USER_NOT_FOUND 
                });
                return;
            }
            
            res.status(HttpStatus.OK).json({ success: true, data: clientDTO });
        } catch (error: unknown) {
            logger.error("Error fetching client data:", error);
            next(error);
        }
    };

    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const clientId = (req as AuthRequest).user.id;
            await this._clientProfileService.updateProfile(clientId, req.body);
            res.status(HttpStatus.OK).json({ 
                success: true, 
                message: HttpResponse.PROFILE_UPDATED 
            });
        } catch (error: unknown) {
            logger.error("Error updating profile:", error);
            next(error);
        }
    };

    preSignedURL = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { fileName, type } = req.query;
            
            if (!fileName || !type) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.FILENAME_OR_TYPE_MISSING
                });
                return;
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

        } catch (error: unknown) {
            logger.error("Error generating presigned URL:", error);
            next(error);
        }
    };

    get_preSignedURL = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { key } = req.query;

            if (!key) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.KEY_MISSING
                });
                return;
            }

            const get_fileURL = await this._clientProfileService.generatePresignedGetUrl(
                key as string,
            );

            res.status(HttpStatus.OK).json({ 
                success: true,
                message: HttpResponse.GET_PRESIGNED_URL_GENERATED, 
                get_fileURL 
            });

        } catch (error: unknown) {
            logger.error("Error generating get presigned URL:", error);
            next(error);
        }
    };

    updateProfileImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const clientId = (req as AuthRequest).user.id;
            const { profileImg } = req.body;
            
            if (!profileImg) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.KEY_MISSING
                });
                return;
            }

            const result = await this._clientProfileService.updateProfileImage(clientId, profileImg);

            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpResponse.PROFILE_PICTURE_CHANGED,
                imageUrl: result.imageUrl
            });
        } catch (error: unknown) {
            logger.error("Error updating profile image:", error);
            next(error);
        }
    };
    
    getClientAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const clientId = (req as AuthRequest).user.id;
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
        } catch (error: unknown) {
            logger.error("Error fetching client appointments:", error);
            next(error);
        }
    };

    cancelAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const clientId = (req as AuthRequest).user.id;
            const { appointmentId } = req.params;
            const { cancelReason } = req.body;
            
            if (!appointmentId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.APPOINTMENT_ID_MISSING
                });
                return;
            }

            if (!cancelReason || cancelReason.trim() === '') {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.CANCEL_REASON_MISSING
                });
                return;
            }

            const result = await this._clientProfileService.cancelAppointment(
                clientId,
                appointmentId,
                cancelReason
            );

            res.status(HttpStatus.OK).json({
                success: true,
                message: result.message,
                refundAmount: result.refundAmount,
                refundPercentage: result.refundPercentage
            });
        } catch (error: unknown) {
            logger.error("Error cancelling appointment:", error);
            next(error);
        }
    };
}