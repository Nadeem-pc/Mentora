import { NextFunction, Request, Response } from "express";

export interface IJobApplicationController {
    listApplications(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
};