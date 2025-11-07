export interface ITherapistInfoDTO {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImg?: string | null;
}

export interface ISlotInfoDTO {
  _id: string;
  time: string;
  fees: number;
  consultationModes: string[];
}

export interface IAppointmentDTO {
  _id: string;
  therapistId: ITherapistInfoDTO;
  slotId: ISlotInfoDTO;
  appointmentDate: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAppointmentListResponseDTO {
  success: boolean;
  data: IAppointmentDTO[];
  page: number;
  limit: number;
}