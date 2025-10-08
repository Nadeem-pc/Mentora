import { ClientProfileController } from "@/controllers/client/implementation/profile.controller";
import { UserRepository } from "@/repositories/implementation/client.repository";
import { AppointmentRepository } from "@/repositories/implementation/appointment.repository";
import { ClientProfileService } from "@/services/client/implementation/profile.service";

const userRepository = new UserRepository();
const appointmentRepository = new AppointmentRepository();

const clientProfileService = new ClientProfileService(userRepository, appointmentRepository);

export const clientProfileController = new ClientProfileController(clientProfileService);