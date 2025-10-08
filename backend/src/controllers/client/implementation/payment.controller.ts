import { Request, Response, NextFunction } from 'express';
import { IPaymentService } from "@/services/client/interface/IPaymentService";
import { IPaymentController } from "../interface/IPaymentController";
import logger from '@/config/logger.config';
import { HttpResponse } from '@/constants/response-message.constant';

export class PaymentController implements IPaymentController {
    constructor(private readonly _paymentService: IPaymentService) {}

    createCheckoutSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { slotId, therapistId, consultationMode, selectedDate, selectedTime } = req.body;
            const userId = (req as any).user?.id;

            if (!slotId || !therapistId || !consultationMode || !selectedDate || !selectedTime) {
                res.status(400).json({
                    success: false,
                    message: HttpResponse.MISSING_FIELDS,
                });
                return;
            }

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: HttpResponse.UNAUTHORIZED,
                });
                return;
            }

            const session = await this._paymentService.createCheckoutSession(
                slotId,
                therapistId,
                userId,
                consultationMode,
                selectedDate,
                selectedTime
            );

            res.status(200).json({
                success: true,
                data: {
                    sessionId: session.sessionId,
                    url: session.url  
                }
            });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const signature = req.headers['stripe-signature'] as string;

            if (!signature) {
                res.status(400).json({
                    success: false,
                    message: HttpResponse.SERVER_ERROR,
                });
                return;
            }

            await this._paymentService.handleWebhook(req.body, signature);

            res.status(200).json({ received: true });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    getPaymentReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                res.status(400).json({
                    success: false,
                    message: HttpResponse.MISSING_FIELDS,
                });
                return;
            }

            const receipt = await this._paymentService.getPaymentReceipt(sessionId);

            res.status(200).json({
                success: true,
                data: receipt,
            });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
}