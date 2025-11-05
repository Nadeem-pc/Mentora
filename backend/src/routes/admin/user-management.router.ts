import { Router } from "express";
import { userManagmentController } from "@/dependencies/admin/user-managment.di";

const userManagmentRouter = Router();

userManagmentRouter.get('/users', userManagmentController.listUsers);
userManagmentRouter.get('/users/:userId', userManagmentController.getUserDetails);
userManagmentRouter.patch('/users/:userId/block', userManagmentController.blockUser);
userManagmentRouter.patch('/users/:userId/unblock', userManagmentController.unblockUser);

export default userManagmentRouter;