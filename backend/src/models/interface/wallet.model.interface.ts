import { Document, Types } from "mongoose";

export interface IWalletModel extends Document {
    ownerId: Types.ObjectId; 
    ownerType: string;
    balance: number;
};