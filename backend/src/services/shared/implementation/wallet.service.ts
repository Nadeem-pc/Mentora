import { IWalletRepository } from "@/repositories/interface/IWalletRepository";
import { ITransactionRepository } from "@/repositories/interface/ITransactionRepository";
import { IWalletService } from "../interface/IWalletService";
import { createHttpError } from "@/utils/http-error.util";
import { HttpStatus } from "@/constants/status.constant";
import logger from "@/config/logger.config";

export class WalletService implements IWalletService {
    constructor(
        private readonly _walletRepository: IWalletRepository,
        private readonly _transactionRepository: ITransactionRepository
    ) {}
    
    getUserWallet = async (userId: string, userType: 'client' | 'therapist' | 'admin') => {
        try {
            const wallet = await this._walletRepository.getOrCreateWallet(userId, userType);
            
            if (!wallet) {
                throw createHttpError(
                    HttpStatus.NOT_FOUND,
                    "Wallet not found"
                );
            }

            const transactions = await this._transactionRepository.findByWalletId(
                wallet._id.toString()
            );

            const totalCredit = transactions
                .filter(t => t.type === 'credit' && t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0);

            const totalDebit = transactions
                .filter(t => t.type === 'debit' && t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0);

            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            
            const thisMonthRevenue = transactions
                .filter(t => 
                    t.type === 'credit' && 
                    t.status === 'completed' &&
                    new Date(t.createdAt) >= firstDayOfMonth
                )
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                wallet: {
                    id: wallet._id,
                    balance: wallet.balance,
                    ownerId: wallet.ownerId,
                    ownerType: wallet.ownerType
                },
                statistics: {
                    totalRevenue: totalCredit,
                    thisMonthRevenue,
                    platformFee: totalDebit,
                    balance: wallet.balance
                },
                transactions: transactions.map(t => ({
                    id: t._id,
                    type: t.type,
                    amount: t.amount,
                    description: t.description,
                    status: t.status,
                    date: t.createdAt,
                    metadata: t.metadata
                }))
            };
        } catch (error) {
            logger.error('Error in getUserWallet service:', error);
            throw error;
        }
    };
}