import { IUserModel } from "@/models/interface/user.model.interface";

export interface IUserRepository {
  createUser(user: IUserModel): Promise<IUserModel>;
  findByEmail(email: string): Promise<IUserModel | null>;
  findUserById(id: string): Promise<IUserModel | null>;
  findAll(): Promise<IUserModel[]>;
  updateUserStatus(id: string, status: string): Promise<IUserModel | null>;
  updatePassword(email: string, hashedPassword: string): Promise<IUserModel | null>;
};