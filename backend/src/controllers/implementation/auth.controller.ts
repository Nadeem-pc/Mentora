import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "@/constants/status.constant";
import { IAuthController } from "../interface/IAuthController";
import { IAuthService } from "@/services/interface/IAuthService";
import { HttpResponse } from "@/constants/response-message.constant";


export class AuthController implements IAuthController {
    constructor(private readonly _authService: IAuthService){};

    registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {firstName, lastName, email, password} = req.body;
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
            res.status(HttpStatus.CREATED).json({ message: HttpResponse.USER_CREATION_SUCCESS, result});
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
    }
};
