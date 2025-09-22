import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "@/constants/status.constant";
import { IAuthController } from "../interface/IAuthController";
import { IAuthService } from "@/services/shared/interface/IAuthService";
import { deleteCookie, setCookie } from "@/utils/refresh-cookie.util";
import logger from "@/config/logger.config";
import { HttpResponse } from "@/constants/response-message.constant";


export class AuthController implements IAuthController {
    constructor(private readonly _authService: IAuthService){};

    registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {    
        try {
            const result = await this._authService.registerUser(req.body);
            res.status(HttpStatus.OK).json(result);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, otp } = req.body;
            const result = await this._authService.verifyOtp(email, otp);
            res.status(HttpStatus.CREATED).json(result);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
    
    resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email } = req.body;
            const result = await this._authService.resendOtp(email);
            res.status(HttpStatus.OK).json(result);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { refreshToken } = req.cookies;
            const { accessToken, refreshToken: newRefreshToken } = await this._authService.refreshAccessToken(refreshToken);

            setCookie(res, newRefreshToken);
            res.status(HttpStatus.OK).json({ token: accessToken });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password } = req.body;
            const { accessToken, refreshToken, user } = await this._authService.login(email, password);
            setCookie(res, refreshToken);

            res.status(HttpStatus.OK).json({ 
                success: true, 
                message: "Login successful", 
                token: accessToken,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                }
            });

        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            deleteCookie(res);
            res.status(HttpStatus.OK).json({ success: true, message: HttpResponse.LOGOUT_SUCCESS });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email } = req.body;
            const verifyForgotPassword = await this._authService.forgotPassword(email);
            res.status(HttpStatus.OK).json(verifyForgotPassword);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction): Promise <void> => {
        try {
            const { password, token } = req.body;
            const updateClientPassword = await this._authService.resetPassword(password, token);
            res.status(HttpStatus.OK).json(updateClientPassword);            
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = (req as any).user;
            const client = await this._authService.getClient(id);
            res.status(HttpStatus.OK).json({
                id: client._id,
                email: client.email,
                role: client.role
            });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
};