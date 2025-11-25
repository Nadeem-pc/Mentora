import { Request, Response, NextFunction } from "express";
import { IChatController } from "@/controllers/shared/interface/IChatController";
import { IChatService } from "@/services/shared/interface/IChatService";
import { HttpStatus } from "@/constants/status.constant";
import logger from "@/config/logger.config";
import { AuthRequest } from "@/types/auth-request";

export class ChatController implements IChatController {
    constructor(private readonly _chatService: IChatService) {}

    getClientMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id: clientId } = (req as AuthRequest).user;
            const therapistId = req.params.therapistId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const messages = await this._chatService.getClientMessages(clientId, therapistId, page, limit);
            res.status(HttpStatus.OK).json({ success: true, data: messages });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    getTherapistMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id: therapistId } = (req as AuthRequest).user;
            const clientId = req.params.clientId;
            const page = parseInt(req.query.page as string) || 1;g
            const limit = parseInt(req.query.limit as string) || 50;

            const messages = await this._chatService.getTherapistMessages(therapistId, clientId, page, limit);
            res.status(HttpStatus.OK).json({ success: true, data: messages });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    getTherapistConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id: therapistId } = (req as AuthRequest).user;
            const conversations = await this._chatService.getTherapistConversations(therapistId);
            res.status(HttpStatus.OK).json({ success: true, data: conversations });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
}