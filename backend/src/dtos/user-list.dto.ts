export interface IUserListDTO {
  _id: string;
  profileImg?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}