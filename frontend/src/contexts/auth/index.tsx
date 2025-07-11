import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthContextType, IUser } from "@/types/auth.types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<IUser | undefined>(undefined);

  return (
    <AuthContext.Provider value={{ 
            userData, 
            setUserData,
        }}>
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