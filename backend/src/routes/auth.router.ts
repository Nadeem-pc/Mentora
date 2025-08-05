import { Router } from 'express';
import { otpSchema, registerSchema } from '@/schemas';
import { validate } from '@/middlewares/validate.middleware';
import { authController } from '@/dependencies/auth.di';
 
const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.registerUser);
authRouter.post('/verify-otp', validate(otpSchema), authController.verifyOtp);
authRouter.post('/resend-otp', authController.resendOtp);

export default authRouter;