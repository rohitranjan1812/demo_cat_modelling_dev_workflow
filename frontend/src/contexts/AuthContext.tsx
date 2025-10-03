import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  userId: string;
  username: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Risk Manager' | 'Analyst' | 'Viewer' | 'Service';
  permissions: string[];
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
  organization?: string;
  department?: string;
  jobTitle?: string;
  preferences?: {
    language: string;
    timezone: string;
    currency: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  
  // Permissions
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canRead: (resource: string) => boolean;
  canWrite: (resource: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (tokens?.accessToken) {
      const refreshInterval = setInterval(() => {
        refreshTokenSilently();
      }, 5 * 60 * 1000); // Refresh every 5 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [tokens]);

  const initializeAuth = async () => {
    try {
      const storedTokens = localStorage.getItem('authTokens');
      const storedUser = localStorage.getItem('user');

      if (storedTokens && storedUser) {
        const parsedTokens = JSON.parse(storedTokens);
        const parsedUser = JSON.parse(storedUser);

        setTokens(parsedTokens);
        setUser(parsedUser);

        // Verify token is still valid
        try {
          const response = await apiService.verifyToken();
          if (response.success) {
            // Update user data from server
            setUser(response.data.user);
          } else {
            throw new Error('Token verification failed');
          }
        } catch (error) {
          // Token is invalid, try to refresh
          const refreshSuccess = await refreshTokenSilently();
          if (!refreshSuccess) {
            clearAuth();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await apiService.login({ username, password });
      
      if (response.success) {
        const { user: userData, tokens: tokenData } = response.data;
        
        setUser(userData);
        setTokens(tokenData);
        
        // Store in localStorage
        localStorage.setItem('authTokens', JSON.stringify(tokenData));
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success(`Welcome back, ${userData.fullName}!`);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (tokens?.refreshToken) {
        await apiService.logout(tokens.refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      toast.success('Logged out successfully');
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!tokens?.refreshToken || isRefreshing) return false;

    setIsRefreshing(true);
    
    try {
      const response = await apiService.refreshToken(tokens.refreshToken);
      
      if (response.success) {
        const newTokens = response.data.tokens;
        setTokens(newTokens);
        
        // Update localStorage
        localStorage.setItem('authTokens', JSON.stringify(newTokens));
        
        return true;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuth();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshTokenSilently = async (): Promise<boolean> => {
    try {
      return await refreshToken();
    } catch (error) {
      // Silent refresh failure - user will need to login again
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      const response = await apiService.updateProfile(updates);
      
      if (response.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Profile updated successfully');
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const clearAuth = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('authTokens');
    localStorage.removeItem('user');
  };

  // Permission checking methods
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    if (user.permissions.includes('admin')) return true;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const canRead = (resource: string): boolean => {
    return hasPermission(`read_${resource}`) || hasPermission('read_all');
  };

  const canWrite = (resource: string): boolean => {
    return hasPermission(`write_${resource}`) || hasPermission('write_all');
  };

  const contextValue: AuthContextType = {
    // State
    user,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    tokens,
    
    // Actions
    login,
    logout,
    refreshToken,
    updateProfile,
    
    // Permissions
    hasPermission,
    hasRole,
    canRead,
    canWrite
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
