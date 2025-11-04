import { IUserRepository } from "@/repositories/interface/IUserRepository";
import { IUserManagmentService } from "../interface/IUserManagmentService";
import { createHttpError } from "@/utils/http-error.util";
import { HttpStatus } from "@/constants/status.constant";
import { HttpResponse } from "@/constants/response-message.constant";
import { UserMapper } from "@/mappers/user.mapper";
import { IUserDTO } from "@/dtos/user.dto";
import { IUserListDTO } from "@/dtos/user-list.dto";

export class UserManagmentService implements IUserManagmentService {
    constructor(private readonly _userRepository: IUserRepository) {};

    listUsers = async (
        search: string,
        page: number,
        limit: number,
        filter: string
    ): Promise<{ users: IUserListDTO[]; total: number; activeCount: number; blockedCount: number }> => {
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
            const filterParts = filter.split('_');
            
            if (filterParts.length === 2) {
                const [role, status] = filterParts;
                
                if (['therapist', 'client'].includes(role)) {
                    query.role = { $regex: new RegExp(`^${role}$`, 'i') };
                }
                
                if (['active', 'blocked'].includes(status)) {
                    query.status = { $regex: new RegExp(`^${status}$`, 'i') };
                }
            } else {
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

        const userListDTOs = UserMapper.toListDTOs(users);
        return { users: userListDTOs, total, activeCount, blockedCount };
    };

    getUserDetails = async (userId: string): Promise<IUserDTO> => {
        if (!userId) {
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.INVALID_CREDENTIALS);
        }

        const user = await this._userRepository.findUserById(userId);

        if (!user) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        }

        return UserMapper.toDTO(user);
    };

    blockUser = async (userId: string): Promise<IUserDTO | null> => {
        const updatedUser = await this._userRepository.updateUserStatus(userId, "Blocked");
        return updatedUser ? UserMapper.toDTO(updatedUser) : null;
    };

    unblockUser = async (userId: string): Promise<IUserDTO | null> => {
        const updatedUser = await this._userRepository.updateUserStatus(userId, "Active");
        return updatedUser ? UserMapper.toDTO(updatedUser) : null;
    };
};