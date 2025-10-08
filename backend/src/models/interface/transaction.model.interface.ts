import { Document, Types } from "mongoose";

export interface ITransactionModel extends Document {
    walletId: Types.ObjectId;
    type: "credit" | "debit";
    amount: number;
    description: string;
    status: "pending" | "completed" | "failed";
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
};