'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../api/client';

export interface UserRole {
  id: string;
  name: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  permissions: string[];
  creationType: 'SYSTEM_GENERATED' | 'INVITED';
  mustChangePassword: boolean;
  isActive: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ mustChangePassword: boolean }>;
  logout: () => void;
  setAuthSession: (token: string, user?: UserProfile) => Promise<void>;
  refreshUser: () => Promise<UserProfile | null>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    if (typeof window === 'undefined') return null;
    try {
      const profile = await apiClient.get<UserProfile>('/auth/me');
      setUser(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fieldops_user', JSON.stringify(profile));
      }
      return profile;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fieldops_token');
        localStorage.removeItem('fieldops_user');
      }
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (typeof window === 'undefined') return;

      const storedToken = localStorage.getItem('fieldops_token');
      const storedUser = localStorage.getItem('fieldops_user');

      if (storedToken) {
        if (isMounted) setToken(storedToken);
        if (storedUser) {
          try {
            if (isMounted) setUser(JSON.parse(storedUser));
          } catch {
            // ignore JSON parse error
          }
        }
        await refreshUser();
      }
      if (isMounted) setIsLoading(false);
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<{ access_token: string; user: UserProfile }>(
        '/auth/login',
        { email, password },
      );

      const { access_token, user: loggedInUser } = response;

      if (typeof window !== 'undefined') {
        localStorage.setItem('fieldops_token', access_token);
        localStorage.setItem('fieldops_user', JSON.stringify(loggedInUser));
      }

      setToken(access_token);
      setUser(loggedInUser);

      return { mustChangePassword: loggedInUser.mustChangePassword };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setAuthSession = useCallback(async (jwtToken: string, userProfile?: UserProfile) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fieldops_token', jwtToken);
    }
    setToken(jwtToken);
    if (userProfile) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('fieldops_user', JSON.stringify(userProfile));
      }
      setUser(userProfile);
    } else {
      await refreshUser();
    }
  }, [refreshUser]);

  const logout = useCallback(() => {
    apiClient.post('/auth/logout').catch(() => {});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fieldops_token');
      localStorage.removeItem('fieldops_user');
    }
    setUser(null);
    setToken(null);
    router.push('/login');
  }, [router]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    if (user.role.name === 'SUPERADMIN') return true;
    return user.permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!user) return false;
    if (user.role.name === 'SUPERADMIN') return true;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.includes(user.role.name);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        setAuthSession,
        refreshUser,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
