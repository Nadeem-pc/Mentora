import { ClientProfileController } from "@/controllers/client/implementation/profile.controller";
import { UserRepository } from "@/repositories/implementation/client.repository";
import { ClientProfileService } from "@/services/client/implementation/profile.service";

export const clientProfileController = new ClientProfileController(new ClientProfileService(new UserRepository()));