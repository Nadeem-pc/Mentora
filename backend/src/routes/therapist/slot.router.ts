import { Router } from "express";
import { slotController } from "@/dependencies/therapist/slot.di";

const slotRouter = Router();

slotRouter.post('/therapist/slot', slotController.createSlot);

export default slotRouter;