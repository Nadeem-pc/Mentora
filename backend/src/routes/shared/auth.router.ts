import { Router } from 'express';
import { otpSchema, registerSchema } from '@/schemas';
import { validate } from '@/middlewares/validate.middleware';
import { authController } from '@/dependencies/shared/auth.di';
import { loginSchema } from '@/schemas/auth/login.schema';
import { forgotPasswordSchema } from '@/schemas/auth/forgot-pass.schema';
import verifyToken from '@/middlewares/verify-token.middleware';
import { resetPasswordSchema } from '@/schemas/auth/reset-pass.schema';
 
const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.registerUser);
authRouter.post('/verify-otp', validate(otpSchema), authController.verifyOtp);
authRouter.post('/resend-otp', authController.resendOtp);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/logout', authController.logout);
authRouter.post('/google-auth', authController.googleAuth);
authRouter.post('/refresh-token', authController.refreshAccessToken);
authRouter.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
authRouter.get('/me', verifyToken(), authController.me);

export default authRouter;