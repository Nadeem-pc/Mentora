import { ITransactionModel } from "@/models/interface/transaction.model.interface";
import { BaseRepository } from "../base.repository";
import Transaction from "@/models/implementation/transaction.model";
import { Types } from "mongoose";
import logger from "@/config/logger.config";
import { ITransactionRepository } from "../interface/ITransactionRepository";

export class TransactionRepository extends BaseRepository<ITransactionModel> implements ITransactionRepository {
    constructor() {
        super(Transaction);
    }

    async createTransaction(data: Partial<ITransactionModel>): Promise<ITransactionModel> {
        try {
            return await this.model.create(data);
        } catch (error) {
            logger.error('Error creating transaction:', error);
            throw new Error("Error creating transaction");
        }
    }

    async findByWalletId(walletId: string, skip?: number, limit?: number): Promise<ITransactionModel[]> {
        try {
            const query = this.model
                .find({ walletId: new Types.ObjectId(walletId) })
                .sort({ createdAt: -1 });

            if (skip !== undefined) query.skip(skip);
            if (limit !== undefined) query.limit(limit);

            return await query.exec();
        } catch (error) {
            logger.error('Error finding transactions by wallet:', error);
            throw new Error("Error fetching transactions");
        }
    }

    async updateTransactionStatus(
        transactionId: string, 
        status: "pending" | "completed" | "failed"
    ): Promise<ITransactionModel | null> {
        try {
            return await this.model.findByIdAndUpdate(
                new Types.ObjectId(transactionId),
                { status },
                { new: true }
            );
        } catch (error) {
            logger.error('Error updating transaction status:', error);
            throw new Error("Error updating transaction");
        }
    }

    async getTransactionsByOwner(ownerId: string, ownerType: string): Promise<ITransactionModel[]> {
        try {
            const wallets = await this.model.aggregate([
                {
                    $lookup: {
                        from: 'wallets',
                        localField: 'walletId',
                        foreignField: '_id',
                        as: 'wallet'
                    }
                },
                { $unwind: '$wallet' },
                {
                    $match: {
                        'wallet.ownerId': new Types.ObjectId(ownerId),
                        'wallet.ownerType': ownerType
                    }
                },
                { $sort: { createdAt: -1 } }
            ]);

            return wallets;
        } catch (error) {
            logger.error('Error getting transactions by owner:', error);
            throw new Error("Error fetching owner transactions");
        }
    }
}