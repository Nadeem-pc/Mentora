import { IUserModel } from "@/models/interface/user.model.interface";
import { BaseRepository } from "../base.repository";
import User from "@/models/implementation/user.model";
import { IUserRepository } from "../interface/IUserRepository";

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

};