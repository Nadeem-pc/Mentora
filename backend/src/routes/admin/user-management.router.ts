import { Router } from "express";
import { userManagmentController } from "@/dependencies/admin/user-managment.di";

const userManagmentRouter = Router();

userManagmentRouter.get('/clients', userManagmentController.listUsers);
userManagmentRouter.patch('/clients/:userId/block', userManagmentController.blockUser);
userManagmentRouter.patch('/clients/:userId/unblock', userManagmentController.unblockUser);

export default userManagmentRouter;