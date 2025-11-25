import { NextFunction, Request, Response } from "express";

export interface IWalletController {
    getUserWallet(req: Request, res: Response, next: NextFunction): Promise<void>;
}