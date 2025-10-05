import { Router } from "express";
import therapistProfileRouter from "./profile.router";
import slotRouter from "./slot.router";

const therapistRouter = Router();

therapistRouter.use('/', therapistProfileRouter);
therapistRouter.use('/', slotRouter);

export default therapistRouter;