import { IAppointment } from "@/models/interface/appointment.model.interface";

export interface IAppointmentRepository {
    createAppointment(data: Partial<IAppointment>): Promise<IAppointment>;
    findById(id: string): Promise<IAppointment | null>;
    findByClientId(clientId: string, skip?: number, limit?: number): Promise<IAppointment[]>;
    findByTherapistId(therapistId: string, skip?: number, limit?: number): Promise<IAppointment[]>;
    findUpcomingAppointments(userId: string, userType: 'client' | 'therapist'): Promise<IAppointment[]>;
    findPastAppointments(userId: string, userType: 'client' | 'therapist'): Promise<IAppointment[]>;
    updateAppointmentStatus(
        appointmentId: string, 
        status: "scheduled" | "completed" | "cancelled",
        cancelReason?: string
    ): Promise<IAppointment | null>;
    findBySlotAndDate(slotId: string, appointmentDate: Date): Promise<IAppointment | null>;
    findByTherapistWithPagination(
        therapistId: string, 
        skip: number, 
        limit: number, 
        status?: string
    ): Promise<IAppointment[]>;
    countByTherapist(therapistId: string, status?: string): Promise<number>;
};