import { therapistProfileController } from "@/dependencies/therapist/profile.di";
import verifyToken from "@/middlewares/verify-token.middleware";
import { Router } from "express";

const therapistProfileRouter = Router();
therapistProfileRouter.use(verifyToken());

therapistProfileRouter.get('/profile', therapistProfileController.getTherapistProfile);
therapistProfileRouter.patch('/profile', therapistProfileController.updateProfile);
therapistProfileRouter.get('/s3-presigned-url', therapistProfileController.preSignedURL);
therapistProfileRouter.get('/s3-getPresigned-url', therapistProfileController.getPreSignedURL);

export default therapistProfileRouter;