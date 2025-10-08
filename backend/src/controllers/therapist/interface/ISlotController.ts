import { NextFunction, Request, Response } from "express";

export interface ISlotController {
    createSlot(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSlots(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteSlot(req: Request, res: Response, next: NextFunction): Promise<void>;
};