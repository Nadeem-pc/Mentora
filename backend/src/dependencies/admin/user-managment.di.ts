import { UserManagmentController } from "@/controllers/admin/implementation/user-management.controller";
import { UserRepository } from "@/repositories/implementation/client.repository";
import { UserManagmentService } from "@/services/admin/implementation/userManagment.service";

export const userManagmentController = new UserManagmentController(new UserManagmentService(new UserRepository()));