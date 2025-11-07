import { Request, Response, NextFunction } from "express";

export interface IUserManagmentController {
    listUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    blockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    unblockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
};