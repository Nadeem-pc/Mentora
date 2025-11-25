import logger from "@/config/logger.config";
import { NextFunction, Request, Response } from "express";
import { IWalletController } from "../interface/IWalletController";
import { IWalletService } from "@/services/shared/interface/IWalletService";
import { HttpStatus } from "@/constants/status.constant";

export class WalletController implements IWalletController {
    constructor(private readonly _walletService: IWalletService) {}
    
    getUserWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => { 
        try {
            const userId = req.user?.id;
            const userType = req.user?.role; 

            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "User not authenticated"
                });
                return;
            }

            const walletData = await this._walletService.getUserWallet(userId, userType);

            res.status(HttpStatus.OK).json({
                success: true,
                message: "Wallet retrieved successfully",
                data: walletData
            });
        } catch (error) {
            logger.error('Error in getUserWallet controller:', error);
            next(error);
        }
    };
}