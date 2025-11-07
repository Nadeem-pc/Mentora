import { ISlotModel } from "@/models/interface/slot.model.interface";
import { IWeeklyScheduleModel } from "@/models/interface/weeklySchedule.model.interface";
import WeeklySchedule from "@/models/implementation/weeklySchedule.model";
import { BaseRepository } from "../base.repository";
import { Types } from "mongoose";
import { ISlotRepository } from "../interface/ISlotRepository";

export class SlotRepository extends BaseRepository<ISlotModel> implements ISlotRepository {
    private weeklyScheduleModel = WeeklySchedule;

    async createWeeklySchedule(therapistId: Types.ObjectId, schedule): Promise<IWeeklyScheduleModel> {
        const weeklySchedule = new this.weeklyScheduleModel({
            therapistId,
            schedule
        });
        return await weeklySchedule.save();
    }

    async getWeeklyScheduleByTherapistId(therapistId: Types.ObjectId): Promise<IWeeklyScheduleModel | null> {
        return await this.weeklyScheduleModel.findOne({ therapistId });
    }

    async updateWeeklySchedule(therapistId: Types.ObjectId, schedule): Promise<IWeeklyScheduleModel | null> {
        return await this.weeklyScheduleModel.findOneAndUpdate(
            { therapistId },
            { schedule },
            { new: true, runValidators: true }
        );
    }
}