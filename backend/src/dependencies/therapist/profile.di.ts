import { TherapistProfileController } from "@/controllers/therapist/implementation/profile.controller";
import { TherapistRepository } from "@/repositories/implementation/therapist.repository";
import { TherapistProfileService } from "@/services/therapist/implementation/profile.service";

export const therapistProfileController = new TherapistProfileController(new TherapistProfileService(new TherapistRepository()));