import { Request, Response, NextFunction } from "express";

export interface IAuthController {
    register(req: Request, res: Response, next: NextFunction): Promise<void>
    login(req: Request, res: Response, next: NextFunction): Promise<void>
}