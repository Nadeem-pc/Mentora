import { IUserRepository } from "@/repositories/interface/IUserRepository";
import { IUserModel } from "@/models/interface/user.model.interface";
import { IUserManagmentService } from "../interface/IUserManagment.service";

export class UserManagmentService implements IUserManagmentService {
    constructor(private readonly _userRepository: IUserRepository) {};

    listUsers = async (
        search: string,
        page: number,
        limit: number,
        filter: string
    ): Promise<{ users: IUserModel[]; total: number; activeCount: number; blockedCount: number }> => {
        const query: any = {};

        if (search) {
            const regex = new RegExp(search, "i"); 
            query.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex }
            ];
        }

        if (filter !== 'all') {
            if (filter === 'active') {
                query.status = { $regex: /^active$/i };
            } else if (filter === 'blocked') {
                query.status = { $regex: /^blocked$/i };
            } else if (filter === 'therapist') {
                query.role = { $regex: /^therapist$/i };
            } else if (filter === 'client') {
                query.role = { $regex: /^client$/i };
            }
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this._userRepository.findAll(query, skip, limit),
            this._userRepository.count(query) 
        ]);

        const baseQuery: any = {};
        if (search) {
            const regex = new RegExp(search, "i");
            baseQuery.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex }
            ];
        }

        const [activeCount, blockedCount] = await Promise.all([
            this._userRepository.count({ ...baseQuery, status: { $regex: /^active$/i } }),
            this._userRepository.count({ ...baseQuery, status: { $regex: /^blocked$/i } })
        ]);

        return { users, total, activeCount, blockedCount };
    };

    blockUser = async (userId: string): Promise<IUserModel | null> => {
        return await this._userRepository.updateUserStatus(userId, "Blocked");
    };

    unblockUser = async (userId: string): Promise<IUserModel | null> => {
        return await this._userRepository.updateUserStatus(userId, "Active");
    };
};