import { ClientTherapistController } from "@/controllers/client/implementation/clientTherapist.controller";
import { TherapistRepository } from "@/repositories/implementation/therapist.repository";
import { SlotRepository } from "@/repositories/implementation/slot.repository";
import { ClientTherapistService } from "@/services/client/implementation/clientTherapist.service";

export const clientTherapistController = new ClientTherapistController(
    new ClientTherapistService(
        new TherapistRepository(),
        new SlotRepository()
    )
);