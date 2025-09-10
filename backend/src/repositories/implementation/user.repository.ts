import { IUserModel } from "@/models/interface/user.model.interface";
import { BaseRepository } from "../base.repository";
import User from "@/models/implementation/user.model";
import { IUserRepository } from "../interface/IUserRepository";
import { Types } from "mongoose";

export class UserRepository extends BaseRepository<IUserModel> implements IUserRepository {
  constructor(){
    super(User)
  }

  async findByEmail(email: string): Promise<IUserModel | null> {
    try {
      return await this.findOne({ email });
    } catch (error) {
      console.error(error);
      throw new Error("Error finding user by email");
    }
  };

  async createUser(user: IUserModel): Promise <IUserModel> {
    try {
      return await this.create(user);
    } catch (error) {
      console.error(error);
      throw new Error("Error creating user");
    }
  };

    async findUserById(id: string): Promise<IUserModel | null> {
    try {
      return await this.findById(new Types.ObjectId(id));
    } catch (error) {
      console.error(error);
      throw new Error("Error while finding user by Id");
    }
  }

  async findAll(): Promise<IUserModel[]> {
    try {
      return await this.model.find();
    } catch (error) {
      console.error(error);
      throw new Error("Error fetching all users");
    }
  }

  async updateUserStatus(id: string, status: string): Promise<IUserModel | null> {
    try {
        return await this.model.findByIdAndUpdate(
            new Types.ObjectId(id),
            { status },
            { new: true }
        );
    } catch (error) {
        console.error(error);
        throw new Error("Error updating user status");
    }
  }

    async updatePassword(email: string, hashedPassword: string): Promise<IUserModel | null> {
    try {
      return await this.model.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } }, { new: true });
    } catch (error) {
      console.error(error);
      throw new Error("errror while updating the password");
    }
  }
};