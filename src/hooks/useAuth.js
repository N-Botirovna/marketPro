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
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Refresh token expired, logging out...');
          }
          await logoutUser();
          setToken(null);
          setIsAuth(false);
          return;
        }
        
        // If access token is expired, try to refresh
        if (isTokenExpired()) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Access token expired, refreshing...');
          }
          const refreshSuccess = await refreshTokenIfNeeded();
          
          if (refreshSuccess) {
            const newToken = getAuthToken();
            setToken(newToken);
            setIsAuth(true);
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ Refresh failed, logging out...');
            }
            await logoutUser();
            setToken(null);
            setIsAuth(false);
          }
        } else {
          // Token is valid, use it
          setToken(currentToken);
          setIsAuth(true);
        }
      } else {
        setToken(null);
        setIsAuth(false);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking auth status:', error);
      }
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

  // Set up periodic token refresh check (only when close to expiry)
  useEffect(() => {
    if (!isAuth) return;

    // Check every 5 minutes instead of 30 seconds
    const interval = setInterval(async () => {
      // Check if refresh token is expired first
      if (isRefreshTokenExpired()) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Refresh token expired, logging out...');
        }
        await logout();
        return;
      }
      
      // Only refresh if actually needed (within 1 minute of expiry)
      if (shouldRefreshToken()) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Token expiring soon, refreshing...');
        }
        const refreshSuccess = await refreshTokenIfNeeded();
        if (refreshSuccess) {
          const newToken = getAuthToken();
          setToken(newToken);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ Refresh failed, logging out...');
          }
          await logout();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

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
