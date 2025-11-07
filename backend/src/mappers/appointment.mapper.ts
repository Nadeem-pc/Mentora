import { IAppointment } from "@/models/interface/appointment.model.interface";
import { IAppointmentDTO, ITherapistInfoDTO, ISlotInfoDTO } from "@/dtos/appointment.dto";

export class AppointmentMapper {
  static toDTO(appointment: IAppointment): IAppointmentDTO {
    const therapistInfo: ITherapistInfoDTO = {
      _id: appointment.therapistId._id.toString(),
      firstName: appointment.therapistId.firstName,
      lastName: appointment.therapistId.lastName,
      email: appointment.therapistId.email,
      profileImg: appointment.therapistId.profileImg || null,
    };

    const slotInfo: ISlotInfoDTO = {
      _id: appointment.slotId._id.toString(),
      time: appointment.slotId.time,
      fees: appointment.slotId.fees,
      consultationModes: appointment.slotId.consultationModes,
    };

    return {
      _id: appointment._id.toString(),
      therapistId: therapistInfo,
      slotId: slotInfo,
      appointmentDate: appointment.appointmentDate,
      status: appointment.status,
      notes: appointment.notes,
      cancelReason: appointment.cancelReason,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };
  }

  static toDTOs(appointments: IAppointment[]): IAppointmentDTO[] {
    return appointments.map((appointment) => this.toDTO(appointment));
  }
}