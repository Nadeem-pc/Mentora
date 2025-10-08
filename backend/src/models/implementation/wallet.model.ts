import { model, Schema } from "mongoose";
import { IWalletModel } from "../interface/wallet.model.interface";

const walletSchema = new Schema<IWalletModel>({
    ownerId: {
        type: Schema.Types.Mixed, 
        required: true,
    },
    ownerType: {
        type: String,
        enum: ["client", "therapist", "admin"],
        required: true, 
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    }
}, { timestamps: true });

export const Wallet = model<IWalletModel>("Wallet", walletSchema);
export default Wallet;