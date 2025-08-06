import { IUserModel } from "@/models/interface/user.model.interface";
// import { Types } from "mongoose";

export interface IUserRepository {
  createUser(user: IUserModel): Promise<IUserModel>;

  findByEmail(email: string): Promise<IUserModel | null>;

//   findOneWithUsernameOrEmail(value: string): Promise<IUserModel | null>

  // findByUsername(username: string): Promise<IUserModel | null>;

  // findUserById(id: string): Promise<IUserModel | null>;

  // updatePassword(email: string, hashedPassword: string): Promise<IUserModel | null>;

  // updateUsername(id: string, username: string): Promise<IUserModel | null>;

  // updateUserProfile(id: string, updateData: Partial<IUserModel>): Promise<IUserModel | null>;

  // updateEmail(id: string, email: string): Promise<IUserModel | null>;

  // updateProfilePicture(id: string, profilePicture: string): Promise<void>;

  // incrementFollow(followerId: Types.ObjectId, followingId: Types.ObjectId): Promise<void> 

  // decrementFollow(followerId: Types.ObjectId, followingId: Types.ObjectId): Promise<void>
}