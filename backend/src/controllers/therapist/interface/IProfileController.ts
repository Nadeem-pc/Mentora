import { NextFunction, Request, Response } from "express";

export interface ITherapistProfileController {
    getTherapistProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    preSignedURL(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPreSignedURL(req: Request, res: Response, next: NextFunction): Promise<void>;
    getApprovalStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
};