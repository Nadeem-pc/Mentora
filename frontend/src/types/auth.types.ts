export interface IUser {
  firstName: string,
  lastName: string,
  email: string,
  accessToken: string,
  isAuthenticated: boolean
}

export interface AuthContextType {
  userData?: IUser;
  setUserData: (user: IUser) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}