import { IUserModel } from "@/models/interface/user.model.interface";

export interface IUserRepository {
  createUser(user: IUserModel): Promise<IUserModel>;
  findByEmail(email: string): Promise<IUserModel | null>;
  findUserById(id: string): Promise<IUserModel | null>;
  findAll(query, skip?: number, limit?: number): Promise<IUserModel[]>;
  count(query): Promise<number>;
  updateUserStatus(id: string, status: string): Promise<IUserModel | null>;
  updatePassword(email: string, hashedPassword: string): Promise<IUserModel | null>;
  updateUserById(id: string, updateData: Partial<IUserModel>): Promise<IUserModel | null>;
}