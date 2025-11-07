import { Types } from "mongoose";
import { IWeeklyScheduleModel } from "@/models/interface/weeklySchedule.model.interface";

export interface ISlotRepository {
    createWeeklySchedule(therapistId: Types.ObjectId, schedule): Promise<IWeeklyScheduleModel>;
    getWeeklyScheduleByTherapistId(therapistId: Types.ObjectId): Promise<IWeeklyScheduleModel | null>;
    updateWeeklySchedule(therapistId: Types.ObjectId, schedule): Promise<IWeeklyScheduleModel | null>;
}