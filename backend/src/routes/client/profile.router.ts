import { Router } from "express";
import { clientProfileController } from "@/dependencies/client/profile.di";
import verifyTokenMiddleware from "@/middlewares/verify-token.middleware";

const clientProfileRouter = Router();
clientProfileRouter.use(verifyTokenMiddleware());

clientProfileRouter.get('/profile', clientProfileController.getClientData);
clientProfileRouter.patch('/profile', clientProfileController.updateProfile);
clientProfileRouter.patch('/profile-img', clientProfileController.updateProfileImage);
clientProfileRouter.get("/s3-presigned-url", clientProfileController.preSignedURL);
clientProfileRouter.get("/s3-getPresigned-url", clientProfileController.get_preSignedURL);

export default clientProfileRouter;