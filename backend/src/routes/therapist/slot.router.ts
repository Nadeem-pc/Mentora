import { Router } from "express";
import { slotController } from "@/dependencies/therapist/slot.di";
import verifyToken from "@/middlewares/verify-token.middleware";

const slotRouter = Router();
slotRouter.use(verifyToken());

slotRouter.post('/slot', slotController.createSlot);
slotRouter.get('/slots', slotController.getSlots);
slotRouter.delete('/slot/:id', slotController.deleteSlot);

export default slotRouter;