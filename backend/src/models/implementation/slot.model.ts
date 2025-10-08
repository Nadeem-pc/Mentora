import { model, Schema } from "mongoose";
import { ISlotModel } from "../interface/slot.model.interface";

const slotSchema = new Schema<ISlotModel>({
    therapistId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    time: {
        type: String, 
        required: true
    },
    fees: {
        type: Number,
        required: true
    },
    consultationModes: {
        type: [String],
        enum: ["Video", "Audio"],
        required: true
    },

}, { timestamps: true });

export const Slot = model<ISlotModel>("Slot", slotSchema);
export default Slot;