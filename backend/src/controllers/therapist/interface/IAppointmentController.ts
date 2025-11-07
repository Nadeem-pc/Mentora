import { NextFunction, Request, Response } from "express";

export interface IAppointmentController {
    getAppointments(req: Request, res: Response, next: NextFunction): Promise<void>;
}