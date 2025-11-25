import { Document, Types } from "mongoose";

export interface IAppointment extends Document {
    therapistId: Types.ObjectId;
    clientId: Types.ObjectId;
    slotId: Types.ObjectId;
    appointmentDate: Date;
    appointmentTime: string;  
    consultationMode: "video" | "audio";  
    status: string;
    transactionId: Types.ObjectId;
    feedbackId: Types.ObjectId | null;
    notes?: string;          
    cancelReason?: string;   
};