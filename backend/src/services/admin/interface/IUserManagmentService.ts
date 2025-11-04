import { IUserDTO } from "@/dtos/user.dto";

export interface IUserManagmentService {
    listUsers(
        search: string,
        page: number,
        limit: number,
        filter: string
    ): Promise<{
        users: IUserDTO[];
        total: number;
        activeCount: number;
        blockedCount: number;
    }>;

    getUserDetails(userId: string): Promise<IUserDTO>;

    blockUser(userId: string): Promise<IUserDTO | null>;

    unblockUser(userId: string): Promise<IUserDTO | null>;
}