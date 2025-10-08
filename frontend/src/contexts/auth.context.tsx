import { AuthService } from '@/services/shared/authServices';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  approvalStatus: string | null;
}

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void; 
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}


const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClient = async () => {
    try {
      const res = await AuthService.fetchClient();
      setUser(res);
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await AuthService.login(email, password);
    localStorage.setItem("accessToken", res.token);
    setUser(res.user);  
  };

  const logout = async () => {
    try {
    await AuthService.logout(); 
  } finally {
    localStorage.removeItem("accessToken");
    setUser(null);
  }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;