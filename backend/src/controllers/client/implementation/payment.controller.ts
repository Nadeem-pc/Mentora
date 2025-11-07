import { Request, Response, NextFunction } from 'express';
import { IPaymentService } from "@/services/client/interface/IPaymentService";
import { IPaymentController } from "../interface/IPaymentController";
import { HttpResponse } from '@/constants/response-message.constant';
import logger from '@/config/logger.config';
import { HttpStatus } from '@/constants/status.constant';

export class PaymentController implements IPaymentController {
    constructor(private readonly _paymentService: IPaymentService) {}

    createCheckoutSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { therapistId, consultationMode, selectedDate, selectedTime, price } = req.body;
            const userId = req.user?.id;

            if (!therapistId || !consultationMode || !selectedDate || !selectedTime || !price) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.MISSING_FIELDS,
                });
                return;
            }

            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ 
                    success: false, 
                    message: HttpResponse.UNAUTHORIZED 
                });
                return;
            }

            const session = await this._paymentService.createCheckoutSession(
                therapistId,
                userId,
                consultationMode,
                selectedDate,
                selectedTime,
                price
            );

            res.status(HttpStatus.OK).json({
                success: true,
                data: { sessionId: session.sessionId, url: session.url }
            });
        } catch (error) {
            logger.error('Create checkout session error:', error);
            next(error);
        }
    };

    handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const signature = req.headers['stripe-signature'] as string;

            if (!signature) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.SERVER_ERROR,
                });
                return;
            }

            await this._paymentService.handleWebhook(req.body, signature);

            res.status(HttpStatus.OK).json({ received: true });
        } catch (error) {
            logger.error('Webhook error:', error);
            next(error);
        }
    };

    getPaymentReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpResponse.MISSING_FIELDS,
                });
                return;
            }

            const receipt = await this._paymentService.getPaymentReceipt(sessionId);

            res.status(HttpStatus.OK).json({ success: true, data: receipt });
            
        } catch (error) {
            logger.error('Get payment receipt error:', error);
            next(error);
        }
    };
}