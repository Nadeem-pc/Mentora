import { IUserModel } from "@/models/interface/user.model.interface";

export interface IUserManagmentService {
    listUsers(
        search: string,
        page: number,
        limit: number,
        filter: string
    ): Promise<{
        users: IUserModel[];
        total: number;
        activeCount: number;
        blockedCount: number;
    }>;

    blockUser(userId: string): Promise<IUserModel | null>;

    unblockUser(userId: string): Promise<IUserModel | null>;
}
