import { AuthController } from "@/controllers/shared/implementation/auth.controller";
import { UserRepository } from "@/repositories/implementation/client.repository";
import { AuthService } from "@/services/shared/implementation/auth.service";

export const authController = new AuthController(new AuthService(new UserRepository()));