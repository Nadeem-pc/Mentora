import { Request, Response, NextFunction } from 'express';

export interface IPaymentController {
    createCheckoutSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPaymentReceipt(req: Request, res: Response, next: NextFunction): Promise<void>;
}