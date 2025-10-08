import { IAppointment } from "@/models/interface/appointment.model.interface";
import { BaseRepository } from "../base.repository";
import { IAppointmentRepository } from "../interface/IAppointmentRepository";
import Appointment from "@/models/implementation/appointment.model";
import { Types } from "mongoose";
import logger from "@/config/logger.config";

export class AppointmentRepository extends BaseRepository<IAppointment> implements IAppointmentRepository {
    constructor() {
        super(Appointment);
    }

    async createAppointment(data: Partial<IAppointment>): Promise<IAppointment> {
        try {
            return await this.model.create(data);
        } catch (error) {
            logger.error('Error creating appointment:', error);
            throw new Error("Error creating appointment");
        }
    }

    async findById(id: string): Promise<IAppointment | null> {
        try {
            return await this.model.findById(new Types.ObjectId(id))
                .populate('therapistId', 'name email')
                .populate('clientId', 'name email')
                .populate('slotId');
        } catch (error) {
            logger.error('Error finding appointment by id:', error);
            throw new Error("Error finding appointment");
        }
    }

    async findByClientId(clientId: string, skip?: number, limit?: number): Promise<IAppointment[]> {
        try {
            const query = this.model
                .find({ clientId: new Types.ObjectId(clientId) })
                .populate('therapistId', 'name email')
                .populate('slotId')
                .sort({ appointmentDate: -1 });

            if (skip !== undefined) query.skip(skip);
            if (limit !== undefined) query.limit(limit);

            return await query.exec();
        } catch (error) {
            logger.error('Error finding appointments by client:', error);
            throw new Error("Error fetching client appointments");
        }
    }

    async findByTherapistId(therapistId: string, skip?: number, limit?: number): Promise<IAppointment[]> {
        try {
            const query = this.model
                .find({ therapistId: new Types.ObjectId(therapistId) })
                .populate('clientId', 'name email')
                .populate('slotId')
                .sort({ appointmentDate: -1 });

            if (skip !== undefined) query.skip(skip);
            if (limit !== undefined) query.limit(limit);

            return await query.exec();
        } catch (error) {
            logger.error('Error finding appointments by therapist:', error);
            throw new Error("Error fetching therapist appointments");
        }
    }

    async findUpcomingAppointments(userId: string, userType: 'client' | 'therapist'): Promise<IAppointment[]> {
        try {
            const currentDate = new Date();
            const filter = userType === 'client' 
                ? { clientId: new Types.ObjectId(userId) }
                : { therapistId: new Types.ObjectId(userId) };

            return await this.model
                .find({
                    ...filter,
                    appointmentDate: { $gte: currentDate },
                    status: 'scheduled'
                })
                .populate(userType === 'client' ? 'therapistId' : 'clientId', 'name email')
                .populate('slotId')
                .sort({ appointmentDate: 1 })
                .exec();
        } catch (error) {
            logger.error('Error finding upcoming appointments:', error);
            throw new Error("Error fetching upcoming appointments");
        }
    }

    async findPastAppointments(userId: string, userType: 'client' | 'therapist'): Promise<IAppointment[]> {
        try {
            const currentDate = new Date();
            const filter = userType === 'client' 
                ? { clientId: new Types.ObjectId(userId) }
                : { therapistId: new Types.ObjectId(userId) };

            return await this.model
                .find({
                    ...filter,
                    $or: [
                        { appointmentDate: { $lt: currentDate } },
                        { status: { $in: ['completed', 'cancelled'] } }
                    ]
                })
                .populate(userType === 'client' ? 'therapistId' : 'clientId', 'name email')
                .populate('slotId')
                .sort({ appointmentDate: -1 })
                .exec();
        } catch (error) {
            logger.error('Error finding past appointments:', error);
            throw new Error("Error fetching past appointments");
        }
    }

    async updateAppointmentStatus(
        appointmentId: string, 
        status: "scheduled" | "completed" | "cancelled",
        cancelReason?: string
    ): Promise<IAppointment | null> {
        try {
            const updateData: any = { status };
            if (cancelReason) {
                updateData.cancelReason = cancelReason;
            }

            return await this.model.findByIdAndUpdate(
                new Types.ObjectId(appointmentId),
                updateData,
                { new: true }
            );
        } catch (error) {
            logger.error('Error updating appointment status:', error);
            throw new Error("Error updating appointment");
        }
    }

    async findBySlotAndDate(
        slotId: string, 
        appointmentDate: Date
    ): Promise<IAppointment | null> {
        try {
            return await this.model.findOne({
                slotId: new Types.ObjectId(slotId),
                appointmentDate: appointmentDate,
                status: { $ne: 'cancelled' }
            });
        } catch (error) {
            logger.error('Error checking slot availability:', error);
            throw new Error("Error checking slot availability");
        }
    }
}