import { Router } from "express";
import { clientTherapistController } from "@/dependencies/client/clientTherapist.di";

const clientTherapistRouter = Router();

clientTherapistRouter.get('/therapists', clientTherapistController.listTherapists);
clientTherapistRouter.get('/therapist/:therapistId/slots', clientTherapistController.getTherapistSlots);

export default clientTherapistRouter;