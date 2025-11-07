import { Request, Response, NextFunction } from "express";
import { ISlotController } from "../interface/ISlotController";
import { ISlotService } from "@/services/therapist/interface/ISlotService";
import { HttpStatus } from "@/constants/status.constant";
import { Types } from "mongoose";
import { HttpResponse } from "@/constants/response-message.constant";
import logger from "@/config/logger.config";

export class SlotController implements ISlotController {
    constructor(private readonly _slotService: ISlotService) {}

    createWeeklySchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const therapistId = req.user.id;
            const { schedule } = req.body;

            if (!schedule || !Array.isArray(schedule)) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.INVALID_SLOT_DATA
                });
                return;
            }

            const result = await this._slotService.createWeeklySchedule(
                new Types.ObjectId(therapistId),
                schedule
            );

            res.status(HttpStatus.CREATED).json({
                success: true,
                message: HttpResponse.SLOT_CREATED,
                data: result
            });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    getWeeklySchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const therapistId = req.user.id;

            const result = await this._slotService.getWeeklySchedule(
                new Types.ObjectId(therapistId)
            );

            res.status(HttpStatus.OK).json({ success: true, data: result });

        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    updateWeeklySchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const therapistId = req.user.id;
            const { schedule } = req.body;

            if (!schedule || !Array.isArray(schedule)) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.INVALID_SLOT_DATA
                });
                return;
            }

            const result = await this._slotService.updateWeeklySchedule(
                new Types.ObjectId(therapistId),
                schedule
            );

            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpResponse.SLOT_EDITED,
                data: result
            });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
}