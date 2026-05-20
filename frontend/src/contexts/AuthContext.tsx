import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiUrl } from '@/lib/apiBase';

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'owner' | 'admin';
  is_admin?: boolean;
  unique_id?: string;
  membershipActive?: boolean;
  membershipPlan?: string | null;
  membershipExpiry?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string | null, password: string, phone: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// NOTE: `VITE_API_URL` should be the backend ORIGIN (no trailing slash).
// If empty, we call relative "/api/..." and rely on Vercel rewrites / same-origin proxy.

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        // Hydrate immediately so refresh does not flash logged-out state
        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              localStorage.removeItem('user');
            }
          }

          try {
            const response = await fetch(apiUrl('/api/user/me'), {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${storedToken}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              setUser(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
            } else if (response.status === 401 || response.status === 403) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            }
            // On 5xx/network errors keep cached user + token for session persistence
          } catch (error) {
            console.error('Token verification failed (keeping session):', error);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', { email, password: '***' });
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          console.log('Login error response:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.log('Login failed with error:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.token || !data.user) {
        throw new Error('Invalid response from server');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string | null, password: string, phone: string) => {
    try {
      setLoading(true);
      console.log('Attempting registration with:', { name, email, phone, password: '***' });
      
      const response = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email: email || null, password, phone }),
      });

      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          console.log('Registration error response:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.log('Registration failed with error:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      
      if (!data.token || !data.user) {
        throw new Error('Invalid response from server');
      }

      // Store token and user
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const activeToken = token || localStorage.getItem('token');
    if (!activeToken) return;

    try {
      const response = await fetch(apiUrl('/api/user/me'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else if (response.status === 401 || response.status === 403) {
        logout();
      }
    } catch (error) {
      console.error('Failed to refresh user data (session kept):', error);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
