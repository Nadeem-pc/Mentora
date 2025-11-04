export interface IUserDTO {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string | null;
  gender?: string | null;
  dob?: string | null;
  profileImg?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}