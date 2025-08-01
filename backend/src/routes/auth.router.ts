import { Router } from 'express'
import { loginSchema, registerSchema } from '@/schemas'
import { validate } from '@/middlewares/validate.middleware'
import { AuthService } from '@/services/implementation/auth.service'
import { AuthController } from '@/controllers/implementation/auth.controller'
import { UserRepository } from '@/repositories/implementation/user.repository'
 

const authRouter = Router()

const userRepository = new UserRepository()
const authService = new AuthService(userRepository)
const authController = new AuthController(authService)

authRouter.post('/register', validate(registerSchema), authController.register.bind(authController));
authRouter.post('/login', validate(loginSchema), authController.login.bind(authController));
authRouter.post('/refresh-token', authController.refreshAccessToken.bind(authController))

export default authRouter