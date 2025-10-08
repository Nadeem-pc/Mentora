import { Document, Types } from "mongoose";

export interface ISlotModel extends Document {
    _id: Types.ObjectId;
    therapistId: Types.ObjectId;
    time: string;
    fees: number;
    consultationModes: string[];
    createdAt: Date;
    updatedAt: Date;
}