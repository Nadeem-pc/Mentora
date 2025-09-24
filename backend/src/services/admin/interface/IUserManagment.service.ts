export interface IUserManagmentService {
    listUsers(): unknown;
    blockUser(userId: string): unknown;
    unblockUser(userId: string): unknown;
};