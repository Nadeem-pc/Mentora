import { IAppointmentRepository } from "@/repositories/interface/IAppointmentRepository";
import { IAppointmentService } from "../interface/IAppointmentService";
import logger from "@/config/logger.config";

export class AppointmentService implements IAppointmentService {
    constructor(private readonly _appointmentRepository: IAppointmentRepository) {}
    
    async getAppointmentsByTherapist(
        therapistId: string,
        page: number = 1,
        limit: number = 12,
        status?: string
    ) {
        try {
            const skip = (page - 1) * limit;

            const appointments = await this._appointmentRepository.findByTherapistWithPagination(
                therapistId,
                skip,
                limit,
                status
            );

            const totalItems = await this._appointmentRepository.countByTherapist(
                therapistId,
                status
            );

            const [all, scheduled, completed, cancelled] = await Promise.all([
                this._appointmentRepository.countByTherapist(therapistId),
                this._appointmentRepository.countByTherapist(therapistId, 'scheduled'),
                this._appointmentRepository.countByTherapist(therapistId, 'completed'),
                this._appointmentRepository.countByTherapist(therapistId, 'cancelled')
            ]);

            const transformedAppointments = appointments.map(apt => {
                const client = apt.clientId as any;
                
                let sessionTime = apt.appointmentTime || '12:00 PM';
                
                if (sessionTime.includes(':') && !sessionTime.includes('AM') && !sessionTime.includes('PM')) {
                    const [hours, minutes] = sessionTime.split(':').map(Number);
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const displayHour = hours % 12 || 12;
                    sessionTime = `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                }
                
                return {
                    id: apt._id.toString(),
                    clientName: `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'Unknown Client',
                    profileImg: client?.profileImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(client?.firstName || 'Unknown')}`,
                    sessionDate: apt.appointmentDate.toISOString().split('T')[0],
                    sessionTime: sessionTime,
                    status: apt.status,
                    sessionMode: apt.consultationMode || 'video'
                };
            });

            const totalPages = Math.ceil(totalItems / limit);

            return {
                success: true,
                appointments: transformedAppointments,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                statusCounts: {
                    all,
                    scheduled,
                    completed,
                    cancelled
                }
            };
        } catch (error) {
            logger.error('Error in getAppointmentsByTherapist:', error);
            throw error;
        }
    }
};