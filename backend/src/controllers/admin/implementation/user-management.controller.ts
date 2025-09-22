import { NextFunction } from "express-serve-static-core";
import { HttpStatus } from "@/constants/status.constant";
import logger from "@/config/logger.config";
import { IUserManagmentController } from "../interface/IUserManagmentController";
import { IUserManagmentService } from "@/services/admin/interface/IUserManagment.service";

export class UserManagmentController implements IUserManagmentController {
    constructor(private readonly _userManagmentService: IUserManagmentService){}

    listUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { search = "", page = "1", limit = "10", filter = "all" } = req.query;

            const { users, total, activeCount, blockedCount } = await this._userManagmentService.listUsers(
                search as string,
                parseInt(page as string, 10),
                parseInt(limit as string, 10),
                filter as string
            );

            return res
            .status(HttpStatus.OK)
            .json({ success: true, data: users, total, activeCount, blockedCount });
        } catch (err) {
            logger.error(err);
            next(err);
        }
    };

    blockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.params.userId;
            const updatedUser = await this._userManagmentService.blockUser(userId);

            if (!updatedUser) {
                res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "User not found" });
                return;
            }

            res.status(HttpStatus.OK).json({ success: true, message: "User blocked successfully", data: updatedUser });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    unblockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.params.userId;
            const updatedUser = await this._userManagmentService.unblockUser(userId);

            if (!updatedUser) {
                res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "User not found" });
                return;
            }

            res.status(HttpStatus.OK).json({ success: true, message: "User unblocked successfully", data: updatedUser });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
};