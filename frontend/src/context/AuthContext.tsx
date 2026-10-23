import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoginRequest, RegisterRequest, User } from '../types/auth';
import { authApi } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authApi.getUser());
  const [token, setToken] = useState<string | null>(authApi.getToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const existingToken = authApi.getToken();
    if (existingToken) {
      authApi
        .getCurrentUser()
        .then((fetchedUser) => {
          setUser(fetchedUser);
          setToken(existingToken);
        })
        .catch(() => {
          setUser(null);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (req: LoginRequest) => {
    const res = await authApi.login(req);
    setUser(res.user);
    setToken(res.accessToken);
  };

  const register = async (req: RegisterRequest) => {
    const res = await authApi.register(req);
    setUser(res.user);
    setToken(res.accessToken);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
