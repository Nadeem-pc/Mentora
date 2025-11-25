export interface IAppointmentService {
    getAppointmentsByTherapist(
        therapistId: string,
        page: number,
        limit: number,
        status?: string
    ): Promise<any>;
}