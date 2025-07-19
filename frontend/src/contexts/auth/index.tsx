// import { createContext, useContext, useState, type ReactNode } from "react";
// import type { AuthContextType, IUser } from "@/types/auth.types";

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
//   const [userData, setUserData] = useState<IUser | undefined>(undefined);

//   return (
//     <AuthContext.Provider value={{ 
//             userData, 
//             setUserData,
//         }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthContextProvider");
//   }
//   return context;
// };



import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { AuthContextType, IUser } from "@/types/auth.types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<IUser | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Login failed");

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
      setError(err.message);
      return false;
    } 
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Registration failed");

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
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