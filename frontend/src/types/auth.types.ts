export interface IUser {
    firstName: string,
    lastName: string,
    email: string,
    accessToken: string,
    isAuthenticated: Boolean
}

// type FormFields = {
//     firstName?: string,
//     lastName?: string,
//     email: string,
//     password: string,
//     confirmPassword?: string
// }

export interface AuthContextType {
  userData: IUser | undefined;
  setUserData: React.Dispatch<React.SetStateAction<IUser | undefined>>;
   login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}