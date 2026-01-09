import { useState, useEffect, useCallback } from 'react';
import { 
  isAuthenticated, 
  getAuthToken, 
  isTokenExpired, 
  isRefreshTokenExpired,
  refreshAccessToken,
  logoutUser 
} from '@/services/auth';
import { getItem } from '@/utils/storage';

export const useAuth = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      // Check if refresh token is expired first
      if (isRefreshTokenExpired()) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Refresh token expired, logging out...');
        }
        await logoutUser();
        setToken(null);
        setIsAuth(false);
        setIsLoading(false);
        return;
      }
      
      const currentToken = getAuthToken();
      
      // If no access token but refresh token exists, try to get a new one
      if (!currentToken) {
        const refreshToken = getItem('refresh_token');
        if (refreshToken && !isRefreshTokenExpired()) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ No access token, but refresh token exists. Refreshing...');
          }
          
          try {
             await refreshAccessToken();
             const newToken = getAuthToken();
             setToken(newToken);
             setIsAuth(true);
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ Refresh failed, logging out...');
            }
            await logoutUser();
            setToken(null);
            setIsAuth(false);
          }
          
          setIsLoading(false);
          return;
        } else {
          // No tokens at all
          setToken(null);
          setIsAuth(false);
          setIsLoading(false);
          return;
        }
      }
      
      // Access token exists. We generally assume it's valid until the API says 401.
      // But if it is clearly expired by pure time check, we can try to refresh proactively on load ONLY.
      if (isTokenExpired()) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Access token expired on load, refreshing...');
        }
        try {
          await refreshAccessToken();
          const newToken = getAuthToken();
          setToken(newToken);
          setIsAuth(true);
        } catch (e) {
             // If refresh fails, we can either logout or just let the interceptor handle the next request failure.
             // But for consistent UI state, let's logout if we are sure.
             await logoutUser();
             setToken(null);
             setIsAuth(false);
        }
      } else {
        // Token is valid, use it
        setToken(currentToken);
        setIsAuth(true);
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

  return {
    isAuthenticated: isAuth,
    isLoading,
    token,
    logout,
    refreshAuth: checkAuthStatus
  };
};
