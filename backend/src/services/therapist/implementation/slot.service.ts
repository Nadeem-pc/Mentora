import { ISlotRepository } from "@/repositories/interface/ISlotRepository";
import { Types } from "mongoose";
import { createHttpError } from "@/utils/http-error.util";
import { ISlotService } from "../interface/ISlotService";
import { ITherapistRepository } from "@/repositories/interface/ITherapistRepository";

export class SlotService implements ISlotService {
    constructor(private readonly _repository: ISlotRepository, private readonly _therapistRepository: ITherapistRepository) {}

    async createWeeklySchedule(therapistId: Types.ObjectId, schedule: any): Promise<any> {
        const existingSchedule = await this._repository.getWeeklyScheduleByTherapistId(therapistId);
        
        if (existingSchedule) {
            createHttpError(400, "Weekly schedule already exists. Use update instead.");
        }

        this.validateSchedule(schedule);

        const weeklySchedule = await this._repository.createWeeklySchedule(therapistId, schedule);

        return {
            id: weeklySchedule._id,
            schedule: weeklySchedule.schedule
        };
    }

    async getWeeklySchedule(therapistId: Types.ObjectId): Promise<any> {
        const weeklySchedule = await this._repository.getWeeklyScheduleByTherapistId(therapistId);

        if (!weeklySchedule) {
            return null;
        }

        return {
            id: weeklySchedule._id,
            schedule: weeklySchedule.schedule
        };
    }

    async updateWeeklySchedule(therapistId: Types.ObjectId, schedule: any): Promise<any> {
        const existingSchedule = await this._repository.getWeeklyScheduleByTherapistId(therapistId);
        
        if (!existingSchedule) {
            createHttpError(404, "Weekly schedule not found. Create one first.");
        }

        this.validateSchedule(schedule);

        const updatedSchedule = await this._repository.updateWeeklySchedule(therapistId, schedule);

        return {
            id: updatedSchedule?._id,
            schedule: updatedSchedule?.schedule
        };
    }

    private validateSchedule(schedule: any[]): void {
        if (!Array.isArray(schedule) || schedule.length === 0) {
            createHttpError(400,"Schedule must contain at least one day");
        }

        const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const seenDays = new Set<string>();

        for (const daySchedule of schedule) {
            if (!validDays.includes(daySchedule.day)) {
                createHttpError(400,`Invalid day: ${daySchedule.day}`);
            }

            if (seenDays.has(daySchedule.day)) {
                createHttpError(400,`Duplicate day found: ${daySchedule.day}`);
            }
            seenDays.add(daySchedule.day);

            if (!Array.isArray(daySchedule.slots) || daySchedule.slots.length === 0) {
                createHttpError(400,`${daySchedule.day} must have at least one slot`);
            }

            for (const slot of daySchedule.slots) {
                if (!slot.startTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.startTime)) {
                    createHttpError(400, `Invalid start time format in ${daySchedule.day}`);
                }

                if (typeof slot.price !== 'number' || slot.price <= 0) {
                    createHttpError(400, `Invalid price in ${daySchedule.day}`);
                }

                if (!Array.isArray(slot.modes) || slot.modes.length === 0) {
                    createHttpError(400,`At least one consultation mode required in ${daySchedule.day}`);
                }

                const validModes = ["video", "audio"];
                for (const mode of slot.modes) {
                    if (!validModes.includes(mode)) {
                        createHttpError(400, `Invalid consultation mode: ${mode}`);
                    }
                }
            }

            this.checkTimeOverlaps(daySchedule.day, daySchedule.slots);
        }
    }

    private checkTimeOverlaps(day: string, slots: any[]): void {
        const SLOT_DURATION = 50; // minutes

        const timeToMinutes = (time: string): number => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        // Sort slots by start time
        const sortedSlots = [...slots].sort((a, b) => 
            timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        );

        for (let i = 0; i < sortedSlots.length - 1; i++) {
            const currentStart = timeToMinutes(sortedSlots[i].startTime);
            const currentEnd = currentStart + SLOT_DURATION;
            const nextStart = timeToMinutes(sortedSlots[i + 1].startTime);

            if (nextStart < currentEnd) {
                createHttpError(
                    400,
                    `Time slots overlap on ${day}: ${sortedSlots[i].startTime} and ${sortedSlots[i + 1].startTime}`,
                );
            }
        }

        // Check if any slot extends past midnight
        for (const slot of slots) {
            const startMinutes = timeToMinutes(slot.startTime);
            const endMinutes = startMinutes + SLOT_DURATION;
            
            if (endMinutes >= 1440) { // 1440 minutes = 24 hours
                createHttpError(
                    400,
                    `Slot on ${day} starting at ${slot.startTime} extends past midnight`,
                );
            }
        }
    }
}