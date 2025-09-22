import { ClientManagmentController } from "@/controllers/admin/implementation/client-management.controller";
import { UserRepository } from "@/repositories/implementation/client.repository";
import { ClientManagmentService } from "@/services/admin/implementation/clientManagment.service";

export const clientManagmentController = new ClientManagmentController(new ClientManagmentService(new UserRepository()))