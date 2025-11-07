export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  profileImg?: string | null;
}

export interface UserDetail extends User {
  phone?: string | null;
  gender?: string | null;
  dob?: string | null;
  createdAt?: Date;
}

export interface UserProfile extends UserDetail {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
}