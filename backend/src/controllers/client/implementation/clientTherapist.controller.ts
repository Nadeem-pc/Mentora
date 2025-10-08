import { Request, Response, NextFunction } from "express";
import { IClientTherapistController } from "../interface/IClientTherapistController";
import logger from "@/config/logger.config";
import { IClientTherapistService } from "@/services/client/interface/IClientTherapistService";
import { HttpResponse } from "@/constants/response-message.constant";

export class ClientTherapistController implements IClientTherapistController {
    constructor(private readonly _clientTherapistService: IClientTherapistService) {};

    listTherapists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const therapists = await this._clientTherapistService.listTherapists();
            res.status(200).json({ success: true, data: therapists });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    getTherapistSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { therapistId } = req.params;
            
            if (!therapistId) {
                res.status(400).json({
                    success: false,
                    message: HttpResponse.THERAPIST_ID_MISSING
                });
                return;
            }

            const slots = await this._clientTherapistService.getTherapistSlots(therapistId);
            
            res.status(200).json({ success: true, data: slots });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
};