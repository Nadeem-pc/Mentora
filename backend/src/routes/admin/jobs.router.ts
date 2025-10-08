import { Router } from "express";
import { jobApplicationController } from "@/dependencies/admin/jobs.di";

const jobsRouter = Router();

jobsRouter.get('/job-applications', jobApplicationController.listApplications);
jobsRouter.patch('/job-applications/:id', jobApplicationController.updateApplicationStatus);

export default jobsRouter;