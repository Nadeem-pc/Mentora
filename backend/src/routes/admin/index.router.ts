import { Router } from "express";
import jobsRouter from "./jobs.router";
import userManagmentRouter from "./user-management.router";

const adminRouter = Router();

adminRouter.use('/', jobsRouter);
adminRouter.use('/', userManagmentRouter);

export default adminRouter;