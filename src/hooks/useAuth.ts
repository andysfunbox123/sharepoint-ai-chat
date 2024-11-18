import { useState, useEffect } from 'react';
import { login, logout, getToken } from '../services/auth';
import { BrowserAuthError } from '@azure/msal-browser';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await getToken();
      setIsAuthenticated(!!token);
      setError(null);
    } catch (err) {
      setIsAuthenticated(false);
      // Only set error for unexpected errors
      if (err instanceof Error && !err.message.includes('No account found')) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login();
      await checkAuth(); // Recheck auth state after login
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err instanceof BrowserAuthError) {
        if (err.errorCode === 'popup_window_error') {
          errorMessage = 'The login popup was blocked. Please allow popups for this site and try again.';
        } else {
          errorMessage = err.errorMessage;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logout();
      setIsAuthenticated(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
  };
}