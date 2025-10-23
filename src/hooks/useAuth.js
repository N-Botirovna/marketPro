import { useState, useEffect, useCallback } from 'react';
import { 
  isAuthenticated, 
  getAuthToken, 
  isTokenExpired, 
  shouldRefreshToken,
  refreshTokenIfNeeded,
  isRefreshTokenExpired,
  logoutUser 
} from '@/services/auth';

export const useAuth = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const hasToken = isAuthenticated();
      const currentToken = getAuthToken();
      
      if (hasToken && currentToken) {
        // Check if refresh token is expired first
        if (isRefreshTokenExpired()) {
          console.log('⚠️ Refresh token is expired, logging out...');
          await logoutUser();
          setToken(null);
          setIsAuth(false);
          return;
        }
        
        // Check if access token is expired
        if (isTokenExpired()) {
          console.log('⚠️ Access token is expired, attempting refresh...');
          const refreshSuccess = await refreshTokenIfNeeded();
          
          if (refreshSuccess) {
            const newToken = getAuthToken();
            setToken(newToken);
            setIsAuth(true);
          } else {
            console.log('❌ Token refresh failed, logging out...');
            await logoutUser();
            setToken(null);
            setIsAuth(false);
          }
        } else {
          setToken(currentToken);
          setIsAuth(true);
        }
      } else {
        setToken(null);
        setIsAuth(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setToken(null);
      setIsAuth(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setToken(null);
      setIsAuth(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Set up periodic token refresh check
  useEffect(() => {
    if (!isAuth) return;

    const interval = setInterval(async () => {
      // Check if refresh token is expired first
      if (isRefreshTokenExpired()) {
        console.log('⚠️ Refresh token expired during periodic check, logging out...');
        await logout();
        return;
      }
      
      // Check if access token needs refresh
      if (shouldRefreshToken()) {
        console.log('🔄 Periodic token refresh check...');
        const refreshSuccess = await refreshTokenIfNeeded();
        if (refreshSuccess) {
          const newToken = getAuthToken();
          setToken(newToken);
        } else {
          console.log('❌ Periodic refresh failed, logging out...');
          await logout();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isAuth, logout]);

  return {
    isAuthenticated: isAuth,
    isLoading,
    token,
    logout,
    refreshAuth: checkAuthStatus
  };
};
