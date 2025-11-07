import { Router } from "express";
import therapistProfileRouter from "./profile.router";
import slotRouter from "./slot.router";
import appointmentRouter from "./appointments.router";
import verifyToken from "@/middlewares/verify-token.middleware";

const therapistRouter = Router();
therapistRouter.use(verifyToken());

therapistRouter.use('/', therapistProfileRouter);
therapistRouter.use('/', slotRouter);
therapistRouter.use('/', appointmentRouter);

export default therapistRouter;