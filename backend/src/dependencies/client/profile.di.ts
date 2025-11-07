import { AppointmentRepository } from "@/repositories/implementation/appointment.repository";
import { SlotRepository } from "@/repositories/implementation/slot.repository";
import Slot from "@/models/implementation/slot.model";
import { UserRepository } from "@/repositories/implementation/client.repository";
import { ClientProfileService } from "@/services/client/implementation/profile.service";
import { ClientProfileController } from "@/controllers/client/implementation/profile.controller";

const userRepository = new UserRepository();
const appointmentRepository = new AppointmentRepository();
const slotRepository = new SlotRepository(Slot);

const clientProfileService = new ClientProfileService(
    userRepository,
    appointmentRepository,
    slotRepository
);

export const clientProfileController = new ClientProfileController(clientProfileService);