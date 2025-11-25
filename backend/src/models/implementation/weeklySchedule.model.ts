import { model, Schema } from "mongoose";
import { IWeeklyScheduleModel } from "../interface/weeklySchedule.model.interface";

const weeklySlotSchema = new Schema({
    startTime: {
        type: String,
        required: true
    },
    modes: {
        type: [String],
        enum: ["video", "audio"],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
});

const dayScheduleSchema = new Schema({
    day: {
        type: String,
        required: true,
        enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    slots: {
        type: [weeklySlotSchema],
        required: true,
        validate: {
            validator: function(slots: any[]) {
                return slots.length > 0;
            },
            message: 'Each day must have at least one slot'
        },
    }
});

const weeklyScheduleSchema = new Schema<IWeeklyScheduleModel>({
    therapistId: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'User'
    },
    schedule: {
        type: [dayScheduleSchema],
        required: true,
        validate: {
            validator: function(schedule: any[]) {
                return schedule.length > 0;
            },
            message: 'Schedule must have at least one day'
        }
    }
}, { 
    timestamps: true 
});

// weeklyScheduleSchema.index({ therapistId: 1 });

export const WeeklySchedule = model<IWeeklyScheduleModel>("WeeklySchedule", weeklyScheduleSchema);
export default WeeklySchedule;