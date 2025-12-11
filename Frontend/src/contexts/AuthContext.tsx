import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/ticket';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:8000/api/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('ticketSystem_user');

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔑 Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Login error response:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            error: errorData.detail || errorData.error || 'Invalid credentials'
          };
        } catch {
          return { success: false, error: 'Login failed' };
        }
      }

      const tokenData = await response.json();
      console.log('✅ Login success:', tokenData);

      
      localStorage.setItem('access_token', tokenData.access);
      localStorage.setItem('refresh_token', tokenData.refresh);

      let userData;
      if (tokenData.user) {
        userData = tokenData.user;
      } else {
        const userResponse = await fetch(`${API_URL}/users/me/`, {
          headers: {
            'Authorization': `Bearer ${tokenData.access}`,
            'Content-Type': 'application/json'
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        userData = await userResponse.json();
      }

      // Transforme les données
      const user: User = {
        id: userData.id.toString(),
        email: userData.email,
        name: userData.username,
        role: userData.role as UserRole,
      };

      setUser(user);
      localStorage.setItem('ticketSystem_user', JSON.stringify(user));

      return { success: true };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
     
      const signupUrl = `${API_URL}/register/`; 
      console.log('📤 Sending signup request to:', signupUrl);

      const response = await fetch(signupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username: name,
          password,
          password2: password,
        }),
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response text:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          console.log('❌ Parsed error data:', errorData);

          let errorMessage = 'Registration failed';
          if (errorData.email) errorMessage = `Email: ${errorData.email[0]}`;
          else if (errorData.username) errorMessage = `Username: ${errorData.username[0]}`;
          else if (errorData.password) errorMessage = `Password: ${errorData.password[0]}`;
          else if (errorData.password2) errorMessage = `Password confirmation: ${errorData.password2[0]}`;
          else if (errorData.non_field_errors) errorMessage = errorData.non_field_errors[0];
          else errorMessage = JSON.stringify(errorData);

          return { success: false, error: errorMessage };
        } catch (parseError) {
          console.log('❌ Could not parse error as JSON:', errorText);
          return { success: false, error: `Server error: ${errorText}` };
        }
      }

      const userData = await response.json();
      console.log('✅ Signup success:', userData);

      
      return await login(email, password);

    } catch (error) {
      console.error('💥 Network error:', error);
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  const logout = () => {
    // CORRIGEZ ICI : Utilisez /users/logout/ comme dans vos urls.py
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      fetch(`${API_URL}/users/logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      }).catch(console.error);
    }

    // Nettoie le localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('ticketSystem_user');

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}