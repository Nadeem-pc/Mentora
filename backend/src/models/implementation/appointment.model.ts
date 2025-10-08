import { model, Schema } from "mongoose";
import { IAppointment } from "../interface/appointment.model.interface";

const appointmentSchema = new Schema<IAppointment>({
    therapistId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    slotId: {
        type: Schema.Types.ObjectId,
        ref: "Slot",
        required: true 
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["scheduled", "completed", "cancelled"],
        default: "scheduled"
    },
    transactionId: { 
        type: Schema.Types.ObjectId, 
        ref: "Transaction" 
    },
    feedbackId: {
        type: Schema.Types.ObjectId,
        ref: "Feedback",
        default: null,
    },
    notes: {
        type: String,
        maxlength: 1000
    },
    cancelReason: {
        type: String,
        maxlength: 500
    }
}, { timestamps: true });

export const Appointment = model<IAppointment>("Appointment", appointmentSchema);
export default Appointment;