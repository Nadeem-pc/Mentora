import { ITransactionModel } from "@/models/interface/transaction.model.interface";

export interface ITransactionRepository {
    createTransaction(data: Partial<ITransactionModel>): Promise<ITransactionModel>;
    findByWalletId(walletId: string, skip?: number, limit?: number): Promise<ITransactionModel[]>;
    updateTransactionStatus(transactionId: string, status: "pending" | "completed" | "failed"): Promise<ITransactionModel | null>;
    getTransactionsByOwner(ownerId: string, ownerType: string): Promise<ITransactionModel[]>;
}