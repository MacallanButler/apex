"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "./apiClient";

interface Profile {
  id: string;
  role: string;
  name: string;
  phone?: string;
  email: string;
}

interface UserContextValue {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  register: (email: string, name: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const currentUser = await apiClient.me();
      if (currentUser) {
        setUser({ id: currentUser.id, email: currentUser.email });
        setProfile(currentUser);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (_) {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    try {
      const loggedInUser = await apiClient.login(email);
      setUser({ id: loggedInUser.id, email: loggedInUser.email });
      setProfile(loggedInUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, name: string, phone?: string) => {
    setLoading(true);
    try {
      const registeredUser = await apiClient.register(email, name, phone);
      setUser({ id: registeredUser.id, email: registeredUser.email });
      setProfile(registeredUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.logout();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, profile, loading, login, register, logout, refresh: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}