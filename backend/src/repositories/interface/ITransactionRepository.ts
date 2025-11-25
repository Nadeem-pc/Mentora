import { ITransactionModel } from "@/models/interface/transaction.model.interface";

export interface ITransactionRepository {
    create(data: Partial<ITransactionModel>): Promise<ITransactionModel>;
    findById(id: string): Promise<ITransactionModel | null>;
    findByWalletId(walletId: string, skip?: number, limit?: number): Promise<ITransactionModel[]>;
    updateStatus(transactionId: string, status: 'pending' | 'completed' | 'failed'): Promise<ITransactionModel | null>;
    countByWalletId(walletId: string): Promise<number>;
}