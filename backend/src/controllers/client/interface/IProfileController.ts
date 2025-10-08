import { NextFunction, Request, Response } from "express";

export interface IClientProfileController {
    getClientData(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    preSignedURL(req: Request, res: Response, next: NextFunction): Promise<void>;
    get_preSignedURL(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfileImage(req: Request, res: Response, next: NextFunction): Promise<void>;
    getClientAppointments(req: Request, res: Response, next: NextFunction): Promise<void>;
};