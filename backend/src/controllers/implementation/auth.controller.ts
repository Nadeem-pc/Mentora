import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "@/constants/status.constant";
import { IAuthController } from "../interface/IAuthController";
import { IAuthService } from "@/services/interface/IAuthService";
import { setCookie } from "@/utils/refresh-cookie.util";

export class AuthController implements IAuthController {
    constructor(private authService: IAuthService){}

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { firstName, lastName, email, password } = req.body
            console.log(req.body)
            const user = await this.authService.register(req.body)
            res.status(HttpStatus.OK).json({email: user})
        } catch (error) {
            next(error)
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const tokens = await this.authService.login(email, password);
            setCookie(res, tokens.refreshToken)
            res.status(HttpStatus.OK).json({ token: tokens.accessToken })
        } catch (error) {
            next(error)
        }
    }

    async refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.cookies;
            console.log('Access Token:', accessToken);
console.log('Refresh Token:', refreshToken);
            console.log('Refresh token', refreshToken)
            const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshAccessToken(refreshToken);
            setCookie(res, newRefreshToken);
            res.status(HttpStatus.OK).json({ token: accessToken });
        } catch (error) {
            next(error);
        }
    };
}
