import { Request, Response, NextFunction } from "express";
import { ISlotController } from "../interface/ISlotController";
import logger from "@/config/logger.config";
import { ISlotService } from "@/services/therapist/interface/ISlotService";
import { HttpResponse } from "@/constants/response-message.constant";

export class SlotController implements ISlotController {
    constructor(private readonly _slotService: ISlotService) {};

    createSlot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { startTime, modes, price } = req.body;
            
            if (!startTime || !modes || !price) {
                res.status(400).json({ success: false, message: HttpResponse.MISSING_FIELDS });
                return;
            }

            if (!Array.isArray(modes) || modes.length === 0) {
                res.status(400).json({
                    success: false,
                    message: "At least one consultation mode is required"
                });
                return;
            }

            const validModes = ["Video", "Audio"];
            const invalidModes = modes.filter(mode => !validModes.includes(mode));
            
            if (invalidModes.length > 0) {
                res.status(400).json({
                    success: false,
                    message: `Invalid consultation modes: ${invalidModes.join(', ')}`
                });
                return;
            }

            if (typeof price !== 'number' || price <= 0) {
                res.status(400).json({
                    success: false,
                    message: "Price must be a positive number"
                });
                return;
            }

            const therapistId = (req as any).user?.id || (req as any).user?._id;
            
            if (!therapistId) {
                res.status(401).json({ success: false, message: HttpResponse.UNAUTHORIZED });
                return;
            }

            const slot = await this._slotService.createSlot({ therapistId, startTime, modes, price });

            res.status(201).json({ success: true, message: HttpResponse.SLOT_CREATED, data: slot });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    getSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const therapistId = (req as any).user?.id || (req as any).user?._id;
            
            if (!therapistId) {
                res.status(401).json({ success: false, message: HttpResponse.UNAUTHORIZED });
                return;
            }

            const slots = await this._slotService.getSlotsByTherapistId(therapistId);

            res.status(200).json({ success: true, message: HttpResponse.SLOTS_RETRIEVED, data: slots });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    deleteSlot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ success: false, message: HttpResponse.INVALID_ID });
                return;
            }

            const therapistId = (req as any).user?.id || (req as any).user?._id;
            
            if (!therapistId) { 
                res.status(401).json({ success: false, message: HttpResponse.UNAUTHORIZED });
                return;
            }

            const deletedSlot = await this._slotService.deleteSlot(id, therapistId);

            if (!deletedSlot) {
                res.status(404).json({ success: false });
                return;
            }

            res.status(200).json({ success: true, message: HttpResponse.SLOT_DELETED, data: deletedSlot });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
};