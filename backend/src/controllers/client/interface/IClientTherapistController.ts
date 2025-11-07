import { NextFunction, Request, Response } from "express";

export interface IClientTherapistController {
    getTherapists(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTherapistDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTherapistSlots(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAvailableSlotsForDate(req: Request, res: Response, next: NextFunction): Promise<void>;
};