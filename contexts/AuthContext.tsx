"use client";
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  const handleLogout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("code_verifier");
    localStorage.removeItem("expire");
    
    // Clear state
    setIsLogin(false);
    
    // Use replace instead of push
    router.replace('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{
      isLogin,
      setIsLogin,
      handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 