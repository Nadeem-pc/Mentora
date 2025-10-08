import { model, Schema } from "mongoose";
import { ITransactionModel } from "../interface/transaction.model.interface";

const transactionSchema = new Schema<ITransactionModel>({
    walletId: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true,
    },
    type: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
    metadata: {
        type: Schema.Types.Mixed,
    }
}, { timestamps: true });

export const Transaction = model<ITransactionModel>("Transaction", transactionSchema);
export default Transaction;