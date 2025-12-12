import { Types } from "mongoose";

export interface ISlotService {
    createWeeklySchedule(therapistId: Types.ObjectId, schedule: any): Promise<any>;
    getWeeklySchedule(therapistId: Types.ObjectId): Promise<any>;
    updateWeeklySchedule(therapistId: Types.ObjectId, schedule: any): Promise<any>;
}