import { AuthController } from "@/controllers/implementation/auth.controller";
import { UserRepository } from "@/repositories/implementation/user.repository";
import { AuthService } from "@/services/implementation/auth.service";

export const authController = new AuthController(new AuthService(new UserRepository()));