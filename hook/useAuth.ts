import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  email: string;
}

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AUTH_STORAGE_KEY = "pokemon_user";


export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback((userData: User) => {
    try {
      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error("Error saving user to localStorage:", error);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    checkAuth,
  };
}