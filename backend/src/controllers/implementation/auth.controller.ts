import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "@/constants/status.constant";
import { IAuthController } from "../interface/IAuthController";
import { IAuthService } from "@/services/shared/interface/IAuthService";
import { setCookie } from "@/utils/refresh-cookie.util";


export class AuthController implements IAuthController {
    constructor(private readonly _authService: IAuthService){};

    registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {    
        try {
            const result = await this._authService.registerUser(req.body);
            res.status(HttpStatus.OK).json(result);
        } catch (error) {
            console.error(error);
            next(error);
        }
    };

    verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, otp } = req.body;
            const result = await this._authService.verifyOtp(email, otp);
            res.status(HttpStatus.CREATED).json(result);
        } catch (error) {
            console.error(error);
            next(error);
        }
    };
    
    resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email } = req.body;
            const result = await this._authService.resendOtp(email);
            res.status(HttpStatus.OK).json(result);
        } catch (error) {
            console.error(error);
            next(error);
        }
    };

    refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { refreshToken } = req.cookies;
            console.log("Refresh Token: ", refreshToken);
            const { accessToken, refreshToken: newRefreshToken } = await this._authService.refreshAccessToken(refreshToken);

            setCookie(res, newRefreshToken);
            res.status(HttpStatus.OK).json({ token: accessToken });
        } catch (error) {
            console.error(error);
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password } = req.body;
            const { accessToken, refreshToken } = await this._authService.login(email, password);
            setCookie(res, refreshToken);

            res.status(HttpStatus.OK).json({ 
                success: true, 
                message: "Login successful", 
                token: accessToken 
            });

        } catch (error) {
            console.error(error);
            next(error);
        }
    };

    forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email } = req.body;
            const verifyForgotPassword = await this._authService.forgotPassword(email);
            res.status(HttpStatus.OK).json(verifyForgotPassword);
        } catch (error) {
            console.error(error);
            next(error);
        }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction): Promise <void> => {
        try {
            const { password, token } = req.body;
            const updateClientPassword = await this._authService.resetPassword(password, token);
            res.status(HttpStatus.OK).json(updateClientPassword);            
        } catch (error) {
            console.error(error);
            next(error);
        }
    };

    // me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    //     try {
    //         const { id } = JSON.parse(req.headers["x-user-payload"] as string)
    //         const user = await this._authService.getUser(id)
    //         res.status(HttpStatus.OK).json(user)
    //     } catch (error) {
    //         console.error(error);
    //         next(error);
    //     }
    // };
};
