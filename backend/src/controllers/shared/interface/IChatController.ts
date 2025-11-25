import { Request, Response, NextFunction } from "express";

export interface IChatController {
    getClientMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTherapistMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTherapistConversations(req: Request, res: Response, next: NextFunction): Promise<void>;
}
