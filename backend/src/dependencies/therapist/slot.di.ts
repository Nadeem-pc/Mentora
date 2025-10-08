import { SlotController } from "@/controllers/therapist/implementation/slot.controller";
import { SlotRepository } from "@/repositories/implementation/slot.repository";
import { SlotService } from "@/services/therapist/implementation/slot.service";

export const slotController = new SlotController(new SlotService(new SlotRepository()));