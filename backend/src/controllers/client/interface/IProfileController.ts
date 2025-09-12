import { NextFunction, Request, Response } from "express";

export interface IClientProfileController {
    getClientData(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
};