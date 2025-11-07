import { Request, Response, NextFunction } from "express";
import { IClientTherapistService } from "@/services/client/interface/IClientTherapistService";
import { HttpResponse } from "@/constants/response-message.constant";
import { HttpStatus } from "@/constants/status.constant";
import logger from "@/config/logger.config";

export class ClientTherapistController {
    constructor(private readonly _clientService: IClientTherapistService) {}

    getTherapists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const therapists = await this._clientService.getTherapists();
            res.status(HttpStatus.OK).json({ success: true, data: therapists });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    getTherapistDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { therapistId } = req.params;

            if (!therapistId) {
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: HttpResponse.THERAPIST_ID_MISSING });
                return;
            }
            const therapist = await this._clientService.getTherapistDetails(therapistId);
            
            res.status(HttpStatus.OK).json({ success: true, data: therapist });

        } catch (error) {
            logger.error(error);
            next(error);
        }
    };    

    getTherapistSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { therapistId } = req.params;
            const slots = await this._clientService.getTherapistSlots(therapistId);
            res.status(HttpStatus.OK).json({ success: true, data: slots});
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    getAvailableSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { therapistId } = req.params;
            const { date } = req.query;

            if (!therapistId || !date) {
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: HttpResponse.THERAPIST_ID_AND_DATE_REQUIRED });
                return;
            }

            const result = await this._clientService.getAvailableSlots(therapistId, date as string);

            res.status(HttpStatus.OK).json({ success: true, data: result });

        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
}