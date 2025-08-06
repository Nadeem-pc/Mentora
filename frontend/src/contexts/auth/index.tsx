import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthContextType, IUser } from "@/types/auth.types";
import { AuthService } from "@/services/authServices";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<IUser | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const result = await AuthService.signIn(email, password);

      const user: IUser = {
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        accessToken: result.token,
        isAuthenticated: true,
      };

      setUserData(user);
      localStorage.setItem("auth", JSON.stringify(user));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      return false;
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    setError(null);
    try {
      await AuthService.signUp(firstName, lastName, email, password);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    setUserData(undefined);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
