import { Router } from "express";
import clientProfileRouter from "./profile.router";
import clientTherapistRouter from "./clientTherapist.router";

const clientRouter = Router();

clientRouter.use('/', clientProfileRouter);
clientRouter.use('/', clientTherapistRouter);

export default clientRouter;