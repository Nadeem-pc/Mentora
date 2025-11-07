import { Request, Response, NextFunction } from "express";

export interface ISlotController {
    createWeeklySchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
    getWeeklySchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateWeeklySchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
}