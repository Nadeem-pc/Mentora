import { IUserModel } from "@/models/interface/user.model.interface";
import { BaseRepository } from "../base.repository";
import User from "@/models/implementation/user.model";
import { IUserRepository } from "../interface/IUserRepository";
import { Types } from "mongoose";
import logger from "@/config/logger.config";

export class UserRepository extends BaseRepository<IUserModel> implements IUserRepository {
  constructor(){
    super(User)
  }

  async findByEmail(email: string): Promise<IUserModel | null> {
    try {
      return await this.findOne({ email });
    } catch (error) {
      logger.error(error);
      throw new Error("Error finding user by email");
    }
  };

  async createUser(user: IUserModel): Promise <IUserModel> {
    try {
      return await this.create(user);
    } catch (error) {
      logger.error(error);
      throw new Error("Error creating user");
    }
  };

  async findUserById(id: string): Promise<IUserModel | null> {
    try {
      return await this.findById(new Types.ObjectId(id));
    } catch (error) {
      logger.error(error);
      throw new Error("Error while finding user by Id");
    }
  }
  
  async findAll(query: any, skip?: number, limit?: number): Promise<IUserModel[]> {
    try {
      return this.model.find(query).skip(skip ?? 0).limit(limit ?? 0);
    } catch (error) {
      logger.error(error);
      throw new Error("Error fetching users");
    }
  }

  async count(query: any): Promise<number> {
    try {
      return this.model.countDocuments(query);
    } catch (error) {
      logger.error(error);
      throw new Error("Error counting users");
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
      logger.error(error);
      throw new Error("Error updating user status");
    }
  }

  async updatePassword(email: string, hashedPassword: string): Promise<IUserModel | null> {
    try {
      return await this.model.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } }, { new: true });
    } catch (error) {
      logger.error(error);
      throw new Error("errror while updating the password");
    }
  }

  async updateUserById(id: string, updateData: Partial<IUserModel>): Promise<IUserModel | null> {
    try {
      return await this.model.findByIdAndUpdate(
        new Types.ObjectId(id),
        { $set: updateData },
        { new: true }
      );
    } catch (error) {
      logger.error(error);
      throw new Error("Error updating user profile");
    }
  }
};