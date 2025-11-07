import { Router } from "express";
import { appointmentController } from "@/dependencies/therapist/appointment.di";

const appointmentRouter = Router();

appointmentRouter.get('/appointments', appointmentController.getAppointments);

export default appointmentRouter;