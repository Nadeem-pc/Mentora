import { Document, Types } from "mongoose";

export interface IWeeklySlot {
    startTime: string;
    modes: string[];
    price: number;
}

export interface IDaySchedule {
    day: string;
    slots: IWeeklySlot[];
}

export interface IWeeklyScheduleModel extends Document {
    therapistId: Types.ObjectId;
    schedule: IDaySchedule[];
    createdAt?: Date;
    updatedAt?: Date;
}