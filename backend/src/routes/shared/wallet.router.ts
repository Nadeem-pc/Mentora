import { walletController } from "@/dependencies/shared/wallet.dit";
import verifyToken from "@/middlewares/verify-token.middleware";
import { Router } from "express";

const walletRouter = Router();

walletRouter.get('/getWallet', verifyToken(), walletController.getUserWallet);

export default walletRouter;