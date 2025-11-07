import { Router } from "express";
import { slotController } from "@/dependencies/therapist/slot.di";
import verifyToken from "@/middlewares/verify-token.middleware";

const slotRouter = Router();
slotRouter.use(verifyToken());

slotRouter.post('/slot', slotController.createWeeklySchedule);
slotRouter.get('/slot', slotController.getWeeklySchedule);
slotRouter.put('/slot', slotController.updateWeeklySchedule); 

export default slotRouter;