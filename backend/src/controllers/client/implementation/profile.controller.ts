import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "@/constants/status.constant";
import { IClientProfileService } from "@/services/client/interface/IProfileService";
import { IClientProfileController } from "../interface/IProfileController";

export class ClientProfileController implements IClientProfileController {
    constructor(private readonly _clientProfileService: IClientProfileService) {}

    getClientData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const clientId = req.user?.id 
            const client = await this._clientProfileService.getClientData(clientId);
            res.status(HttpStatus.OK).json({ success: true, data: client });
        } catch (error) {
            console.error(error);
            next(error);
        }
    };

    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const client = req.user?.id 
            await this._clientProfileService.updateProfile(client, req.body);
            res.status(HttpStatus.OK).json({ success: true, message: 'Profile updated successfully'});
        } catch (error) {
            console.error(error);
            next(error);
        }
    };
};