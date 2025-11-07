import { SlotController } from "@/controllers/therapist/implementation/slot.controller";
import { SlotService } from "@/services/therapist/implementation/slot.service";
import { SlotRepository } from "@/repositories/implementation/slot.repository";
import Slot from "@/models/implementation/slot.model"; 

export const slotController = new SlotController(new SlotService(new SlotRepository(Slot)));