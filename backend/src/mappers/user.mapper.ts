import { IUserModel } from "@/models/interface/user.model.interface";
import { IUserDTO, IUserListDTO, IUserProfileDTO } from "@/dtos/user.dto";

export class UserMapper {
  static toDTO(user: IUserModel): IUserDTO {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      gender: user.gender || null,
      dob: user.dob || null,
      profileImg: user.profileImg || null,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  static toListDTO(user: IUserModel): IUserListDTO {
    return {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      profileImg: user.profileImg ?? null,
    };
  }

  static toProfileDTO(user: IUserModel): IUserProfileDTO {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || null,
      gender: user.gender || null,
      dob: user.dob || null,
      createdAt: user.createdAt,
      profileImg: user.profileImg || null
    };
  }

  static toDTOs(users: IUserModel[]): IUserDTO[] {
    return users.map((user) => this.toDTO(user));
  }

  static toListDTOs(users: IUserModel[]): IUserListDTO[] {
    return users.map((user) => this.toListDTO(user));
  }

  static toProfileDTOs(users: IUserModel[]): IUserProfileDTO[] {
    return users.map((user) => this.toProfileDTO(user));
  }
}