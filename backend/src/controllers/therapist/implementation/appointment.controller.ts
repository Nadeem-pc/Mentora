import { IAppointmentService } from "@/services/therapist/interface/IAppointmentService";
import { IAppointmentController } from "../interface/IAppointmentController";
import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "@/constants/status.constant";
import logger from "@/config/logger.config";

export class AppointmentController implements IAppointmentController {
    constructor(private readonly _appointmentService: IAppointmentService) {}

    getAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const therapistId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 12;
            const status = req.query.status as string;

            const result = await this._appointmentService.getAppointmentsByTherapist(
                therapistId,
                page,
                limit,
                status
            );

            res.status(HttpStatus.OK).json(result);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
}