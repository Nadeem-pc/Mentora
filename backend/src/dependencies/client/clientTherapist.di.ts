import { ClientTherapistService } from "@/services/client/implementation/clientTherapist.service";
import { TherapistRepository } from "@/repositories/implementation/therapist.repository";
import { ClientTherapistController } from "@/controllers/client/implementation/clientTherapist.controller";
import { SlotRepository } from "@/repositories/implementation/slot.repository";
import { AppointmentRepository } from "@/repositories/implementation/appointment.repository";

export const clientController = new ClientTherapistController(
    new ClientTherapistService(
        new TherapistRepository(),
        new SlotRepository(),
        new AppointmentRepository()
    )
);