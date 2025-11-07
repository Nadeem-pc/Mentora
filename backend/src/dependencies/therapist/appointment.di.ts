import { AppointmentController } from "@/controllers/therapist/implementation/appointment.controller";
import { AppointmentRepository } from "@/repositories/implementation/appointment.repository";
import { AppointmentService } from "@/services/therapist/implementation/appointment.service";


export const appointmentController = new AppointmentController(new AppointmentService(new AppointmentRepository()));