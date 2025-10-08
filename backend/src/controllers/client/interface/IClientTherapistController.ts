import { NextFunction, Request, Response } from "express";

export interface IClientTherapistController {
    listTherapists(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTherapistSlots(req: Request, res: Response, next: NextFunction): Promise<void>;
};