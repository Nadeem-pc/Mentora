export interface IClientTherapistService {
    getTherapists(): Promise<any>;
    getTherapistDetails(therapistId: string): Promise<any>;
    getTherapistSlots(therapistId: string): Promise<any>;
    getAvailableSlots(therapistId: string, date: string): Promise<any>;
}
