import { JobApplicationController } from "@/controllers/admin/implementation/jobs.controller";
import { TherapistRepository } from "@/repositories/implementation/therapist.repository";
import { JobApplicationService } from "@/services/admin/implementation/jobs.service";

export const jobApplicationController = new JobApplicationController(new JobApplicationService(new TherapistRepository()));