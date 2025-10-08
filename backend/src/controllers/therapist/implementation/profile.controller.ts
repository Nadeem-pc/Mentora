import { ITherapistProfileService } from "@/services/therapist/interface/IProfileService";
import { ITherapistProfileController } from "../interface/IProfileController";
import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "@/constants/status.constant";
import { HttpResponse } from "@/constants/response-message.constant";
import logger from "@/config/logger.config";

export class TherapistProfileController implements ITherapistProfileController {
    constructor(private readonly _therapistProfileService: ITherapistProfileService) {}

    getTherapistProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const therapistId = req.user?.id;
            const therapist = await this._therapistProfileService.getTherapistProfile(therapistId);
            res.status(HttpStatus.OK).json({ success: true, data: therapist }); 
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const therapistId = req.user?.id;
            
            if (!therapistId) {
                res.status(HttpStatus.UNAUTHORIZED).json({  success: false,  message: HttpResponse.UNAUTHORIZED });
                return;
            }

            const result = await this._therapistProfileService.updateProfile(therapistId, req.body);
            
            res.status(HttpStatus.OK).json({  success: true,  message: HttpResponse.PROFILE_UPDATED, data: result  });
        } catch (error) {
            logger.error(error);
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

            const { uploadURL, fileURL } = await this._therapistProfileService.generatePresignedUploadUrl( 
                fileName as string, 
                type as string 
            );
            
            res.status(HttpStatus.OK).json({ 
                success: true,
                message: HttpResponse.PRESIGNED_URL_GENERATED, 
                uploadURL, 
                fileURL 
            });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    getPreSignedURL = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { key } = req.query;

            if (!key) {
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: HttpResponse.KEY_MISSING });
                return;
            }

            const get_fileURL = await this._therapistProfileService.generatePresignedGetUrl(key as string);

            res.status(HttpStatus.OK).json({ 
                success: true,
                message: HttpResponse.GET_PRESIGNED_URL_GENERATED, 
                get_fileURL 
            });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
}